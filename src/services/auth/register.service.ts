import { User } from "@prisma/client";
import {
   APP_URL,
   CUPON_DISCOUNT_AMOUNT,
   CUPON_DISCOUNT_TYPE,
   CUPON_EXP_MONTHS,
   JWT_SECRET,
   LOGIN_EXPIRATION,
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

export const registerService = async (
   body: Pick<User, "username" | "email" | "password" | "referralCode">
) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
   });
   if (existingUser) {
      if (existingUser.deletedAt) {
         throw new ApiError("User have been register but deleted", 409);
         // give logic to restore the user
      }
      throw new ApiError("User already exists", 409);
   }
   const existingReferral = await validatingRefferalCode(body.referralCode);
   const result = await prisma.$transaction(async (tx) => {
      const referralCode = nanoid(6);
      body.password = await hashPassword(body.password!);

      const newUser = await tx.user.create({
         data: {
            username: body.username,
            email: body.email.toLowerCase(),
            password: body.password,
            referralCode: referralCode,
         },
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
      // generate token fo verification email
      const tokenPayload = {
         id: newUser.id,
         role: newUser.role,
      };
      const token = sign(tokenPayload, JWT_SECRET as string, {
         expiresIn: LOGIN_EXPIRATION,
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
         to: body.email,
         subject: "Welcome to Our Service",
         html: html,
      });
      return {token , user: newUser};
   });
   return {
      user : result.user,
      message: `Welcome ${body.username}, to our service`,
      token: result.token,
   };
};
