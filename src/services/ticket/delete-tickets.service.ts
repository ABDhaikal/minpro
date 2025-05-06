import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteTicketService = async (authID: string, ticketId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      events: {
        select: {
          status: true,
          organizers: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  if (ticket.events.organizers.userId !== authID) {
    throw new ApiError("forbidden", 403);
  }

  if (ticket.buyed > 0) {
    throw new ApiError("Ticket already buyed, cant be delete", 400);
  }

  const deletedTicket = await prisma.ticket.delete({
    where: { id: ticketId },
  });

  if (!deletedTicket) {
    throw new ApiError("Failed to delete ticket", 500);
  }
  return {
    success: true,
    message: "ticket deleted successfully",
    data: deletedTicket,
  };
};
