import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventOrgLocService = async (authid: string) => {
  const existingOrganizer = await prisma.organizer.findFirst({
    where: {
      users: {
        id: authid,
        role: "ADMIN",
      },
      deletedAt: null,
    },
  });
  if (!existingOrganizer) {
    throw new ApiError("Organizer not found", 404);
  }
  const locations = await prisma.event.findMany({
    where: {
      deletedAt: null,
      organizerId: existingOrganizer.id,
    },
    orderBy: {
      location: "asc", // Sort locations in ascending order
    },
    select: {
      location: true,
    },

    distinct: ["location"], // Ensure that only distinct (unique) locations are returned
  });

  if (!locations) {
    throw new ApiError("Location is empty", 404);
  }

  const data = locations.map((item) => item.location);

  return { data: data, message: "Location retrieved successfully" };
};
