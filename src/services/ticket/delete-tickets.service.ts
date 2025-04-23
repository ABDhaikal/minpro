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
  
  if (ticket.deletedAt && ticket.events.status !== "DRAFT") {
    throw new ApiError("Ticket already deleted", 400);
  }

  if (ticket.events.status === "DRAFT") {
    const deletedTicket = await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return {
      success: true,
      message: "Voucher deleted successfully",
      data: deletedTicket,
    };
  } else {
    const deletedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Ticket deleted successfully",
      data: deletedTicket,
    };
  }
};
