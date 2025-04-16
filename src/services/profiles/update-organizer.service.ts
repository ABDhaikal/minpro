import { Organizer } from "@prisma/client";
import slugify from "slugify";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const updateOrganizerService = async (
   senderId: string,
   inputData: Organizer,
   inputProfilePict?: Express.Multer.File
) => {
   const validdatingOrganizer = await prisma.organizer.findUnique({
      where: {
         userId: senderId,
      },
   });
   if (!validdatingOrganizer) {
      throw new ApiError("Organizer not found", 404);
   }

   if (inputData.name) {
      const existingName = await prisma.organizer.findUnique({
         where: {
            name: inputData.name,
         },
         select: {
            id: true,
         },
      });

      if (existingName && existingName.id !== validdatingOrganizer.id) {
         throw new ApiError("Organizer name already exists", 409);
      }

      inputData.slug = slugify(inputData.name, {
         replacement: "_",
         lower: true,
      });
   }

   if (inputProfilePict) {
      const { secure_url } = await cloudinaryUpload(
         inputProfilePict,
         "organizer/profile"
      );

      if (validdatingOrganizer.organizerPicture) {
         await cloudinaryRemove(validdatingOrganizer.organizerPicture);
      }
      inputData.organizerPicture = secure_url;
   }

   const updatedUser = await prisma.user.update({
      where: {
         id: senderId,
      },
      data: {
         ...inputData,
      },
   });

   return updatedUser;
};
