import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const updateUsernameService = async (
  senderId: string,
  inputData: Pick<User, "username">
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

  return updatedUser;
};
