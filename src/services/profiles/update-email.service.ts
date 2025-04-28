import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const updateProfileService = async (
  senderId: string,
  inputData: Pick<User, "email">,
  inputProfilePict?: Express.Multer.File
) => {
  const validatingUser = await prisma.user.findUnique({
    where: {
      id: senderId,
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!validatingUser || validatingUser.deletedAt) {
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

  const updatedUser = await prisma.user.update({
    where: {
      id: senderId,
    },
    data: {
      email: inputData.email,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};
