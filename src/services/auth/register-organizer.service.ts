import { Organizer } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { JWT_SECRET, LOGIN_EXPIRATION } from "../../config/env";
import prisma from "../../config/prisma";
import { cloudinaryUpload } from "../../lib/cloudinary";
import slugify from "slugify";
import { ApiError } from "../../utils/api-error";

export const registerOrganizerService = async (
   authID: string,
   picture: Express.Multer.File,
   body: Omit<Organizer, "id" | "createdAt" | "updatedAt" | "deletedAt">
) => {
   const validatingUser = await prisma.user.findUnique({
      where: {
         id: authID,
         deletedAt: null,
      },
   });
   if (!validatingUser) {
      throw new Error("User not found");
   }
   if (validatingUser.role !== "USER") {
      throw new Error("User already registered as organizer");
   }

   if (picture) {
      const { secure_url } = await cloudinaryUpload(picture, `organizer `);
      body.organizerPicture = secure_url;
   }

   body.slug = slugify(body.name, {
      lower: true,
      strict: true,
   });
   const existingOrganizer = await prisma.organizer.findMany({
      where: {
         name: { contains: body.name, mode: "insensitive" },
         OR: [{ slug: body.slug }],
      },
   });
   if (existingOrganizer.length > 0) {
      throw new Error("Organizer name already exists");
   }
   const newUser = await prisma.user.update({
      where: {
         id: authID,
      },
      data: {
         role: "ADMIN",
         organizer: {
            create: {
               ...body,
            },
         },
      },
      include: {
         organizer: true,
      },
   });
   if (!newUser) {
      throw new ApiError("Failed to register organizer", 500);
   }
   const tokenPayload = {
      id: newUser.id,
      role: newUser.role,
   };
   const token = sign(tokenPayload, JWT_SECRET as string, {
      expiresIn: LOGIN_EXPIRATION,
   });

   return {
      message: `now you are an organizer of ${newUser.organizer!.name}`,
      token: token,
   };
};
