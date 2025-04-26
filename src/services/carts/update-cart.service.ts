import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface ICartService {
  cartId: string;
  amount: number;
}

export const updateCartService = async (body: ICartService, userId: string) => {
  const cart = await prisma.cart.findFirst({
    where: { id: body.cartId, userId },
    include: {
      tickets: {
        select: { amount: true, buyed: true },
      },
    },
  });

  if (!cart) {
    throw new ApiError("Invalid cart ID", 400);
  }

  const available = cart.tickets.amount - cart.tickets.buyed;

  if (body.amount <= 0) {
    throw new ApiError("amount should more than 0", 400);
  }

  if (body.amount > available) {
    throw new ApiError(
      `Cannot update cart. Requested amount (${body.amount}) exceeds available tickets (${available}).`,
      400
    );
  }

  const updatedCart = await prisma.cart.update({
    where: { id: body.cartId },
    data: body,
  });

  return updatedCart;
};
