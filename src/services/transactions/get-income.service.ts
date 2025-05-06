import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface getIncomeServiceQuery {
  eventid: string | null | undefined;
}

export const getIncomeService = async (
  authUserId: string,
  queries: getIncomeServiceQuery
) => {
  // existing organizer
  const existingOrganizer = await prisma.organizer.findUnique({
    where: {
      userId: authUserId,
    },
    include: {
      events: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existingOrganizer) {
    throw new ApiError("User is not an organizer", 401);
  }

  if (queries.eventid) {
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: queries.eventid,
        deletedAt: null,
      },
      include: {
        organizers: {
          select: {
            users: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!existingEvent) {
      throw new ApiError("Event not found ", 404);
    }
    if (existingEvent.organizers.users.id !== authUserId) {
      throw new ApiError("Unauthorized to access this event", 401);
    }
  }

  const whereClauseTransaction: Prisma.TransactionWhereInput = {};
  whereClauseTransaction.deletedAt = null;
  whereClauseTransaction.status = "DONE";

  queries.eventid =
    !queries.eventid || queries.eventid === "" ? undefined : queries.eventid;

  whereClauseTransaction.transactionTicket = {
    some: {
      tickets: {
        events: {
          id: queries.eventid,
          organizerId: existingOrganizer.id,
        },
        deletedAt: null,
      },
      deletedAt: null,
    },
  };

  const transaction = await prisma.transaction.findMany({
    where: whereClauseTransaction,
    select: {
      totalPrice: true,
      totalPriceBeforeDiscount: true,
    },
  });

  const totalIncome = transaction.reduce((acc, curr) => {
    return acc + Number(curr.totalPrice);
  }, 0);

  const totalIncomeBeforeDiscount = transaction.reduce((acc, curr) => {
    return acc + Number(curr.totalPriceBeforeDiscount);
  }, 0);

  return {
    data: {
      totalIncome: totalIncome,
      totalIncomeBeforeDiscount: totalIncomeBeforeDiscount,
    },
    message: "Get income success",
  };
};
