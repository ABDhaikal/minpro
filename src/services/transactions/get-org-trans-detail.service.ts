import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getOrgTransDetailService = async (
  authid: string,
  reciptNumber: string
) => {
  // validating authid
  const existingOrganizer = await prisma.organizer.findFirst({
    where: { users: { id: authid } },
  });
  if (!existingOrganizer) {
    throw new ApiError("Organizer not found", 404);
  }

  const transactions = await prisma.transaction.findFirst({
    where: {
      reciptNumber: reciptNumber,
      transactionTicket: {
        some: { tickets: { events: { organizerId: existingOrganizer.id } } },
      },
    },
    include: {
      users: {
        omit: {
          password: true,
        },
      },
      transactionTicket: {
        include: {
          tickets: {
            include: {
              events: true,
            },
          },
        },
      },
      voucherTransaction: {
        include: {
          eventVoucher: true,
        },
      },
      cuponTransactions: {
        include: {
          CuponDiscount: true,
        },
      },
    },
  });

  if (!transactions) {
    throw new ApiError("Transaction Not found", 404);
  }

  return {
    data: transactions,
    message: "Transactions fetched successfully",
  };
};
