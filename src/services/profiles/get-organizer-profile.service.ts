import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getOrganizerProfileService = async (authUserId: string) => {
  const existingOrganizer = await prisma.organizer.findUnique({
    where: {
      userId: authUserId,
      deletedAt: null,
    },
  });
  if (!existingOrganizer) {
    throw new ApiError("User is not an organizer", 401);
  }
  return { data: existingOrganizer, message: "Get organizer profile success" };
};
