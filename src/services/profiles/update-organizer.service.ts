import { Organizer } from "@prisma/client";
import slugify from "slugify";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const updateOrganizerService = async (
   senderId: string,
   inputData: Organizer,
   picture?: Express.Multer.File
) => {
   const validdatingOrganizer = await prisma.organizer.findUnique({
      where: {
         userId: senderId,
      },
      include: {
         users: {
            select: {
               deletedAt: true,
            },
         },
      },
   });
   if (!validdatingOrganizer || validdatingOrganizer.users.deletedAt) {
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
   else {
      inputData.slug = validdatingOrganizer.slug;
      inputData.name = validdatingOrganizer.name;
   }

   if (!inputData.bankTarget){
      inputData.bankTarget = validdatingOrganizer.bankTarget;
   }

   if(!inputData.description) {
      inputData.description = validdatingOrganizer.description;
   }

   if (inputData.paymentTarget) {
      inputData.paymentTarget = Number(inputData.paymentTarget);
      if (isNaN(inputData.paymentTarget) || inputData.paymentTarget < 0) {
         throw new ApiError("invalid payment target", 400);
      }
   } else {
      inputData.paymentTarget = validdatingOrganizer.paymentTarget;
   }

   if (picture) {
      const { secure_url } = await cloudinaryUpload(
         picture,
         "organizer/profile"
      );

      if (validdatingOrganizer.organizerPicture) {
         await cloudinaryRemove(validdatingOrganizer.organizerPicture);
      }
      inputData.organizerPicture = secure_url;
   } else {
      inputData.organizerPicture = validdatingOrganizer.organizerPicture;
   }

   const updatedUser = await prisma.organizer.update({
      where: {
         userId: senderId,
      },
      data: {
         ...inputData,
      },
   });

   return updatedUser;
};
