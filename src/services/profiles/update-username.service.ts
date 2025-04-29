import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { JWT_SECRET, LOGIN_EXPIRATION } from "../../config/env";
import { sign } from "jsonwebtoken";

export const updateUsernameService = async (
  senderId: string,
  inputData: Pick<User, "username">
) => {
  if (
    !inputData.username ||
    inputData.username.length < 3 ||
    inputData.username.length > 20
  ) {
    throw new ApiError("Username must be between 3 and 20 characters", 400);
  }

  if (typeof inputData.username !== "string") {
    throw new ApiError("Username must be a string", 400);
  }

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

  const updatedUser = await prisma.user.update({
    where: {
      id: senderId,
    },
    data: {
      username: inputData.username,
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
    user: updatedUser,
    accessToken: accessToken,
    message: "Update username success",
  };
};
