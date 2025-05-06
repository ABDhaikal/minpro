import { EventVoucher, Ticket } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const updateTicketService = async (
  ticketID: string,
  authID: string,
  data: Omit<Ticket, "id" | "buyed">
) => {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketID,
    },
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
    throw new ApiError("Forbidden", 403);
  }

  const validatingNameTicket = await prisma.ticket.findFirst({
    where: {
      eventId: data.eventId,
      name: data.name,
    },
  });

  if (validatingNameTicket && validatingNameTicket.id !== ticketID) {
    throw new ApiError("Ticket name already exists", 400);
  }

  if (ticket.buyed > data.amount) {
    throw new ApiError("Ticket quota cant less than buyed", 400);
  }

  // Buat voucher baru
  const createdTicket = await prisma.ticket.update({
    where: {
      id: ticketID,
    },
    data: {
      name: data.name,
      price: data.price,
      amount: data.amount,
    },
  });
  return {
    message: "Ticket created successfully",
    data: createdTicket,
  };
};
