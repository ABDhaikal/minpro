import prisma from "../../config/prisma";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

export const resetPasswordService = async (
   userId: string,
   newPassword: string
) => {
   // validate userId and password
   if (!newPassword) {
      throw new ApiError("New password is required", 400);
   }

   const existingUser = await prisma.user.findUnique({
      where: {
         id: userId,
      },
      select: {
         id: true,
         deletedAt: true,
      },
   });
   if (!existingUser || existingUser.deletedAt) {
      throw new ApiError("invalid token", 401);
   }

   const hashedPassword = await hashPassword(newPassword);

   // update user data
   const updatePassword = await prisma.user.update({
      where: {
         id: userId,
      },
      data: {
         password: hashedPassword,
      },
      select: {
         id: true,
      },
   });

   if (!updatePassword) {
      throw new ApiError("Failed to update password", 500);
   }
   return "Password updated successfully";
};
