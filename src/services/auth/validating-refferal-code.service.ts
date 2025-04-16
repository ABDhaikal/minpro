import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const validatingRefferalCodeService = async (referralCode: string) => {
   if (!referralCode || referralCode.trim() === "") {
      throw new ApiError("Referral code is required", 400);
   }
   const existingReferral = await prisma.user.findUnique({
      where: { referralCode: referralCode },
      select: {
         id: true,
         deletedAt: true,
      },
   });
   if (!existingReferral || existingReferral.deletedAt) {
      throw new ApiError("Referral code is invalid", 400);
   }
   return true;
};
