import slugify from "slugify";
import prisma from "../../config/prisma";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";
import { User } from "@prisma/client";

export const updateProfileService = async (
   sender: User,
   inputData: User,
   inputProfilePict?: Express.Multer.File
) => {
   const validatingUser = await prisma.user.findUnique({
      where: {
         id: sender.id,
      },
      select: {
         id: true,
         profilePict: true,
      },
   });

   if (!validatingUser) {
      throw new ApiError("User not found", 404);
   }

   return {};
};
