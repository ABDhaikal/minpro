import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventService = async (slug: string) => {
  const event = await prisma.event.findUnique({
    where: {
      slug,
      deletedAt: null,
      status: "PUBLISH",
      eventEnd: {
        gt: new Date(),
      },
    },
    include: {
      tickets: true,
      organizers: {
        select: {
          id: true,
          name: true,
          organizerPicture: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError("Event not Found", 404);
  }
  return {
    event,
  };
};
