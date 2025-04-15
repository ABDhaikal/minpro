import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const validatingRefferalCodeService = async (referralCode: string) => {
   const existingReferral = await prisma.user.findUnique({
      where: { referralCode: referralCode },
      select: {
         id: true,
      },
   });
   if (!existingReferral) {
      throw new ApiError("Referral code is invalid", 400);
   }
   return true;
};
