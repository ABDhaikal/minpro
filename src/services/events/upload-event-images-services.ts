// import prisma from "../../config/prisma";
// import { ApiError } from "../../utils/api-error";
// import { cloudinaryUpload } from "../../lib/cloudinary";

// export const uploadEventImagesService = async (
//   eventId: string,
//   uploadImage: Express.Multer.File[],
//   thumbnailIndex: number
// ) => {
//   if (!uploadImage || uploadImage.length === 0) {
//     throw new ApiError("Images are required", 400);
//   }

//   if (thumbnailIndex < 0 || thumbnailIndex >= uploadImage.length) {
//     throw new ApiError("Invalid thumbnail index", 400);
//   }

//   const event = await prisma.event.findUnique({
//     where: { id: eventId },
//     select: { id: true ,
//       name: true
//     },
//   });

//   if (!event) {
//     throw new ApiError("Event not found", 404);
//   }

//   const imageUpload = await Promise.all(
//     uploadImage.map(async (file, index) => {
//       const { secure_url } = await cloudinaryUpload(file, `event_images/${event.name}`);

//       return await prisma.image.create({
//         data: {
//           eventId,
//           imageUrl: secure_url,
//           isThumbnail: index === thumbnailIndex,
//         },
//       });
//     })
//   );

//   const thumbnailImage = imageUpload.find((img) => img.isThumbnail) || imageUpload[0];

//   if (!thumbnailImage) {
//     throw new ApiError("Failed to assign a thumbnail image", 400);
//   }

//   await prisma.event.update({
//     where: { id: eventId },
//     data: { imageId: thumbnailImage.id },
//   });

//   return {
//     message: "Images uploaded successfully",
//     data: imageUpload,
//   };
// };
