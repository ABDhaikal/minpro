import prisma from "../../config/prisma";
import { User } from "@prisma/client";
import { ApiError } from "../../utils/api-error";
import { hashPassword } from "../../lib/argon";
import { ref } from "process";
import { CUPON_EXP_MONTHS } from "../../config/env";

interface RegisterUser {
   userData: Omit<User, "point" | "referralCode">;
   referralCode?: string;
}

const validatingRefferalCode = async (referralCode: string | undefined) => {
   if (!referralCode) return null;
   const existingReferral = await prisma.user.findUnique({
      where: { referralCode: referralCode },
      select: {
         id: true,
      },
   });

   return existingReferral as string | null;
};

export const registerService = async (body: RegisterUser) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: body.userData.email },
   });

   if (existingUser) {
      if (existingUser.deletedAt) {
         // give logic to restore the user
      }
      throw new ApiError("User already exists", 409);
   }

   const existingReferral = await validatingRefferalCode(body.referralCode);
   if (!existingReferral) {
      throw new ApiError("Referral code is invalid", 400);
   }

   const referralCode = Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase();
   const hashedPassword = await hashPassword(body.userData.password!);
   body.userData.password = hashedPassword;

   const inputData = {
      referralCode: referralCode,
      ...body.userData,
   };
   const newUser = await prisma.user.create({
      data: inputData,
      omit: {
         password: true,
      },
   });

   await prisma.userPoint.create({
      data: {
         userId: newUser.id,
         amount: 0,
      },
   });
   // check if the referral code is valid
   if (existingReferral) {
      await prisma.userPoint.update({
         where: { userId: existingReferral },
         data: {
            amount: {
               increment: 10000,
            },
         },
      });

      await prisma.cuponDiscount.create({
         data: {
            userId: newUser.id,
            amount: 10000,
            type: "FIXED_AMOUNT",
            expiredAt: new Date(
               new Date().setMonth(new Date().getMonth() + CUPON_EXP_MONTHS)
            ),
         },
      });
   }

   return newUser;
};
