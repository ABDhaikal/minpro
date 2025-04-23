import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const  getTicketsByEventIdService = async (
  eventId: string
) => {
  if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
    throw new ApiError(
      "Event ID is required and must be a non-empty string",
      400
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { eventId},
    orderBy: { createdAt: "desc" },
  });

  if (!tickets || tickets.length === 0) {
    throw new ApiError("No tickets found for this event", 404);
  }

  return {
    message: "Tikcets retrieved successfully",
    data: tickets,
  };
};
