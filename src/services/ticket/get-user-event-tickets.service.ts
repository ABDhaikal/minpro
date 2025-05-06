import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getUserEventTicketsService = async (authUserId: string) => {
  const data = await prisma.userEventTicket.findMany({
    where: {
      usersEvent: {
        userId: authUserId,
      },
    },
    include: {
      ticket: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
      usersEvent: {
        select: {
          id: true,
          eventId: true,
          review: true,
          rating: true,
          event: true,
        },
      },
    },
  });

  if (!data || data.length === 0) {
    throw new ApiError("No tickets found for the specified user.");
  }

  return {
    data: data,
    message: "Success",
  };
};
