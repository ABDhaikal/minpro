import { log } from "console";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventService = async (slug: string) => {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      Ticket: true,
      organizers: {
        select: {
            id: true,
            name: true,
            organizerPicture: true,
        }
      },
      Image: {
        select: {
          id: true,
          imageUrl: true,
          isThumbnail: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError("Event not Found", 404);
  }
  return event;
};
