import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getOrgDetailEventService = async (
  authUserId: string,
  id: string
) => {
  const existingOrganizer = await prisma.organizer.findFirst({
    where: {
      users: {
        id: authUserId,
        role: "ADMIN",
      },
      deletedAt: null,
    },
  });
  if (!existingOrganizer) {
    throw new ApiError("Organizer not found", 404);
  }

  const event = await prisma.event.findUnique({
    where: {
      id: id,
      deletedAt: null,
    },
    include: {
      tickets: true,
      eventVoucher: true,
      usersEvents: true,
    },
  });

  if (!event) {
    throw new ApiError("Event not Found", 404);
  }

  if (event.organizerId !== existingOrganizer.id) {
    throw new ApiError("Event not Found", 404);
  }

  return {
    data: event,
    message: "Event retrieved successfully",
  };
};
