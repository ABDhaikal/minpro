import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getOrgAllEventNameService = async (authid: string) => {
  const existingOrganizer = await prisma.organizer.findFirst({
    where: {
      userId: authid,
      deletedAt: null,
    },
  });
  if (!existingOrganizer) {
    throw new ApiError("Organizer not found", 404);
  }
  if (existingOrganizer.deletedAt) {
    throw new ApiError("Organizer not found", 404);
  }

  const events = await prisma.event.findMany({
    where: {
      organizerId: existingOrganizer.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      location: true,
      tickets: {
        where: {
          deletedAt: null,
        },
        select: {
          name: true,
        },
      },
    },
  });

  if (!events) {
    throw new ApiError("Event not found", 404);
  }
  const data = events.map((event) => ({
    id: event.id,
    name: event.name,
    location: event.location,
    tickets: event.tickets.map((ticket) => ticket.name),
  }));

  return { data: data, message: "success" };
};
