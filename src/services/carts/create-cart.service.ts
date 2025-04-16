import { Cart } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface ITicket {
  ticketId: string;
  amount: number;
}

interface ICartService {
  data: ITicket[];
}

export const createCartService = async (
  body: ICartService,
  userId: string
): Promise<Cart[]> => {
  const result: Cart[] = [];

  for (const { ticketId, amount } of body.data) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { amount: true, buyed: true },
    });

    if (!ticket) {
      throw new ApiError(`Ticket with ID ${ticketId} not found.`, 404);
    }

    const available = ticket.amount - ticket.buyed;

    const existingCart = await prisma.cart.findFirst({
      where: {
        userId,
        ticketId,
      },
    });

    const currentInCart = existingCart?.amount || 0;

    const totalRequested = currentInCart + amount;

    if (totalRequested > available) {
      throw new ApiError(
        `Not enough tickets available for ticket ID ${ticketId}. Available: ${available}, Requested: ${totalRequested}`,
        400
      );
    }

    if (existingCart) {
      const updatedItem = await prisma.cart.update({
        where: { id: existingCart.id },
        data: {
          amount: totalRequested,
        },
      });
      result.push(updatedItem);
    } else {
      const newItem = await prisma.cart.create({
        data: {
          userId,
          ticketId,
          amount,
        },
      });
      result.push(newItem);
    }
  }

  return result;
};
