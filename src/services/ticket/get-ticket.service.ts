import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getTicketService = async (ticketId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      eventId: true,
      name: true,
      price: true,
      amount: true,
      buyed: true,
    },
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  return ticket;
};
