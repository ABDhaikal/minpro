import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteCartService = async (ticketId: string,userId:string) => {
  const carts = await prisma.cart.findFirst({
    where: { ticketId,
      userId
     },

  });

  if (!carts) {
    throw new ApiError("Ticket ID not found in any cart", 400);
  }

  await prisma.cart.delete({
    where: { id: carts.id },
  });



  return { message: "deleted cart success" };
};
