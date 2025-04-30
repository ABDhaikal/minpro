import prisma from "../../config/prisma";
import { hashPassword, verifyPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

export const updatePasswordService = async (
   userId: string,
   oldpassword: string,
   newPassword: string
) => {
   if (!oldpassword) {
      throw new ApiError("Password is required", 400);
   }
   if (!newPassword) {
      throw new ApiError("New password is required", 400);
   }
   const existingUser = await prisma.user.findUnique({
      where: {
         id: userId,
      },
      select: {
         id: true,
         password: true,
         deletedAt: true,
      },
   });

   if (!existingUser || existingUser.deletedAt) {
      throw new ApiError("User not found", 404);
   }
   const isPasswordValid = await verifyPassword(
      oldpassword,
      existingUser.password
   );
   if (!isPasswordValid) {
      throw new ApiError("Invalid password", 400);
   }
   const hashedPassword = await hashPassword(newPassword);

   const updatedUser = await prisma.user.update({
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
   if (!updatedUser) {
      throw new ApiError("Failed to update password", 500);
   }
   return "Password updated successfully";
};
