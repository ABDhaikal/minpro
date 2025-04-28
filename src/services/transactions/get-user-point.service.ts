import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getUserPointService = async (authUserId: string) => {
  const data = await prisma.userPoint.findFirst({
    where: {
      userId: authUserId,
    },
  });

  if (!data) throw new ApiError("cant find user Point");

  return {
    data: data,
    message: "succes",
  };
};
