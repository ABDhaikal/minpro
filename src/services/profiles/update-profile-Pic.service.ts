import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";
import { sign } from "jsonwebtoken";
import { JWT_SECRET, LOGIN_EXPIRATION } from "../../config/env";
import { access } from "fs";

export const updateProfilePictService = async (
  senderId: string,
  inputProfilePict: Express.Multer.File
) => {
  if (!inputProfilePict) {
    throw new ApiError("Image is required", 400);
  }
  const validatingUser = await prisma.user.findUnique({
    where: {
      id: senderId,
    },
    select: {
      id: true,
      profilePict: true,
      deletedAt: true,
    },
  });

  if (!validatingUser || validatingUser.deletedAt) {
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

  const tokenPayload = {
    id: updatedUser.id,
    role: updatedUser.role,
  };
  const accessToken = sign(tokenPayload, JWT_SECRET as string, {
    expiresIn: LOGIN_EXPIRATION,
  });

  return {
    accessToken: accessToken,
    user: updatedUser,
    message: "Profile picture updated successfully",
  };
};
