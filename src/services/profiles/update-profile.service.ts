import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const updateProfileService = async (
   senderId: string,
   inputData: Pick<User, "username" | "email" | "profilePict">,
   inputProfilePict?: Express.Multer.File
) => {
   const validatingUser = await prisma.user.findUnique({
      where: {
         id: senderId,
      },
      select: {
         id: true,
         profilePict: true,
      },
   });

   if (!validatingUser) {
      throw new ApiError("User not found", 404);
   }

   const existingEmail = await prisma.user.findUnique({
      where: {
         email: inputData.email,
      },
      select: {
         id: true,
      },
   });

   if (existingEmail && existingEmail.id !== senderId) {
      throw new ApiError("Email already exists", 409);
   }

   if (inputProfilePict) {
      const { secure_url } = await cloudinaryUpload(
         inputProfilePict,
         "user/profile"
      );

      if (validatingUser.profilePict) {
         await cloudinaryRemove(validatingUser.profilePict);
      }
      inputData.profilePict = secure_url;
   }

   const updatedUser = await prisma.user.update({
      where: {
         id: senderId,
      },
      data: {
         ...inputData,
      },
      omit: {
         password: true,
      },
   });

   return updatedUser;
};
