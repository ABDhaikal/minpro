import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const updateProfilePictService = async (
   senderId: string,
   inputProfilePict: Express.Multer.File
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

   const { secure_url } = await cloudinaryUpload(
      inputProfilePict,
      "user/profile"
   );

   if (validatingUser.profilePict) {
      await cloudinaryRemove(validatingUser.profilePict);
   }

   const updatedUser = await prisma.user.update({
      where: {
         id: senderId,
      },
      data: {
         profilePict: secure_url,
      },
      omit: {
         password: true,
      },
   });

   return updatedUser;
};
