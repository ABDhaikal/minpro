import { Organizer, User } from "@prisma/client";
import {
   APP_URL,
   CUPON_DISCOUNT_AMOUNT,
   CUPON_DISCOUNT_TYPE,
   CUPON_EXP_MONTHS,
   JWT_SECRET,
   POINT_EXP_MONTHS,
} from "../../config/env";
import prisma from "../../config/prisma";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";
import { transporter } from "../../lib/nodemailer";
import Handlebars from "handlebars";
import { join } from "path";
import fs from "fs/promises";
import { sign } from "jsonwebtoken";
import { nanoid } from "nanoid";
import slugify from "slugify";

interface RegisterUser {
   userData: Omit<User, "referralCode">;
   referralCode?: string;
   organizerData?: Organizer;
}

const validatingRefferalCode = async (referralCode: string | undefined) => {
   if (!referralCode || !referralCode.trim()) return null;

   if (typeof referralCode !== "string") {
      throw new ApiError("Referral code must be a string", 400);
   }

   const existingReferral = await prisma.user.findUnique({
      where: { referralCode: referralCode },
      select: {
         id: true,
      },
   });
   if (!existingReferral) {
      throw new ApiError("Referral code is invalid", 400);
   }
   return existingReferral as User;
};

const validateOrganizerData = async (organizerData: Organizer | undefined) => {
   if (!organizerData) return false;
   if (!organizerData.name) return false;
   if (organizerData) {
      const existingOrganizer = await prisma.organizer.findUnique({
         where: { name: organizerData.name },
      });
      if (existingOrganizer) {
         throw new ApiError("Organizer name already exists", 409);
      }
   }
   organizerData.slug = slugify(organizerData.name, {
      replacement: "_",
      lower: true,
   });

   return organizerData;
};

export const registerService = async (body: RegisterUser) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: body.userData.email },
   });
   if (existingUser) {
      if (existingUser.deletedAt) {
         throw new ApiError("User have been register but deleted", 409);
         // give logic to restore the user
      }
      throw new ApiError("User already exists", 409);
   }
   const existingReferral = await validatingRefferalCode(body.referralCode);
   const ValidOrganizerData = await validateOrganizerData(body.organizerData);
   const result = await prisma.$transaction(async (tx) => {
      const referralCode = nanoid(6);
      body.userData.password = await hashPassword(body.userData.password!);
      if (ValidOrganizerData) body.userData.role = "ADMIN";
      const inputData = {
         referralCode: referralCode,
         ...body.userData,
      };

      const newUser = await tx.user.create({
         data: inputData,
         omit: {
            password: true,
         },
      });

      await tx.userPoint.create({
         data: {
            userId: newUser.id,
            amount: 0,
         },
      });

      if (existingReferral) {
         await tx.userPoint.update({
            where: { userId: existingReferral.id },
            data: {
               amount: {
                  increment: 10000,
               },
               expiredAt: new Date(
                  new Date().setMonth(new Date().getMonth() + POINT_EXP_MONTHS)
               ),
            },
         });

         await tx.cuponDiscount.create({
            data: {
               userId: newUser.id,
               amount: CUPON_DISCOUNT_AMOUNT,
               quantity: 1,
               used: 0,
               type: CUPON_DISCOUNT_TYPE,
               expiredAt: new Date(
                  new Date().setMonth(new Date().getMonth() + CUPON_EXP_MONTHS)
               ),
            },
         });
      }
      if (ValidOrganizerData) {
         await tx.organizer.create({
            data: {
               ...ValidOrganizerData,
               userId: newUser.id,
            },
         });
      }
      // generate token fo verification email
      const tokenPayload = {
         id: newUser.id,
      };
      const token = sign(tokenPayload, JWT_SECRET as string, {
         expiresIn: "2h",
      });

      // send verification email
      const templatePath = join(__dirname, "../../templates/welcome-email.hbs");
      const templateSource = (await fs.readFile(templatePath)).toString();
      const compiledTemplate = Handlebars.compile(templateSource);
      const link = `${APP_URL}`;
      const html = compiledTemplate({
         name: newUser.username,
         link: link,
      });

      transporter.sendMail({
         to: body.userData.email,
         subject: "Welcome to Our Service",
         html: html,
      });
      return newUser;
   });
   return result;
};
