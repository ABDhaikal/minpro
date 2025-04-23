import { Ticket } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const createTicketService = async (
  authID: string,
  EventID: string,
  data: Ticket
) => {
  const event = await prisma.event.findUnique({
    where: { id: EventID },
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

  const validatingNameTicket = await prisma.ticket.findFirst({
    where: {
      eventId: data.eventId,
      name: data.name,
    },
  });

  if (validatingNameTicket) {
    throw new ApiError("Ticket name already exists", 400);
  }

  const createdTicket = await prisma.ticket.create({
    data: {
      eventId: EventID,
      name: data.name,
      amount: data.amount,
      price: data.price,
      buyed: 0,
    },
  });
  return {
    message: "Ticket created successfully",
    data: createdTicket,
  };
};
