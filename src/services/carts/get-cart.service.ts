import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getCartService = async (userId: string) => {
  const carts = await prisma.organizer.findMany({
    where: {
      events: {
        some: {
          tickets: {
            some: {
              Carts: {
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
      events: {
        where: {
          tickets: {
            some: {
              Carts: {
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
          tickets: {
            omit: {
              eventId: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
            where: {
              Carts: {
                some: {
                  userId: userId,
                },
              },
            },
            include: {
              Carts: true,
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
