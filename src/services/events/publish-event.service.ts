import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const publishEventService = async (authID: string, eventId: string) => {
  if (eventId === undefined) {
    throw new ApiError("Event ID is required");
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    include: {
      organizers: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError("Event not found", 404);
  }

  if (event.organizers.userId !== authID) {
    throw new ApiError("Forbidden", 403);
  }
  if (event.status === "PUBLISH") {
    throw new ApiError("Event already published", 400);
  }

  const existsTicket = await prisma.ticket.findMany({
    where: { eventId: event.id },
  });

  if (!existsTicket || existsTicket.length === 0) {
    throw new ApiError("Event must have at least one ticket", 400);
  }
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISH" },
  });

  return {
    message: "Event published successfully",
    data: updatedEvent,
  };
};
