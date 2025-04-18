import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getCartService = async (userId: string) => {
  const carts = await prisma.organizer.findMany({
    where: {
      Event: {
        some: {
          Ticket: {
            some: {
              Cart: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      organizerPicture: true,
      Event: {
        where: {
          Ticket: {
            some: {
              Cart: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        },
        omit: {
          organizerId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        include: {
          Ticket: {
            omit: {
              eventId: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
            where: {
              Cart: {
                some: {
                  userId: userId,
                },
              },
            },
            include: {
              Cart: true,
            },
          },
        },
      },
    },
  });

  if (!carts || carts.length === 0) {
    throw new ApiError("Cart is empty");
  }

  return carts;
};
