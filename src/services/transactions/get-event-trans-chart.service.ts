import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface IGetEventTransChartService {
  datefrom: string | null | undefined;
  eventid: string | null | undefined;
}

interface groupedTransactions {
  date: string;
  WAITING_FOR_PAYMENT: number;
  WAITING_FOR_ADMIN_CONFIRMATION: number;
  DONE: number;
  REJECTED: number;
  EXPIRED: number;
  CANCELED: number;
}

export const getEventTransChartService = async (
  authUserId: string,
  queries: IGetEventTransChartService
) => {
  const existingOrganizer = await prisma.organizer.findUnique({
    where: {
      userId: authUserId,
      deletedAt: null,
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

  whereClauseTransaction.createdAt = {
    gte: queries.datefrom ? new Date(queries.datefrom) : undefined,
  };

  const transactions = await prisma.transaction.findMany({
    where: whereClauseTransaction,
    orderBy: { createdAt: "asc" }, // Order by most recent
    select: {
      createdAt: true,
      status: true,
      transactionTicket: {
        select: {
          quantity: true,
        },
      },
    },
  });

  if (!transactions) {
    throw new ApiError("No transactions found for this user", 404);
  }
  // grouping the transactions by date
  let groupedTransactions: groupedTransactions[] = [];
  let groupedTicket: groupedTransactions[] = [];
  let TotalGroupedTransactions: groupedTransactions = {
    date: "Total",
    WAITING_FOR_PAYMENT: 0,
    WAITING_FOR_ADMIN_CONFIRMATION: 0,
    DONE: 0,
    REJECTED: 0,
    EXPIRED: 0,
    CANCELED: 0,
  };
  let TotalGroupedTicket: groupedTransactions = {
    date: "Total",
    WAITING_FOR_PAYMENT: 0,
    WAITING_FOR_ADMIN_CONFIRMATION: 0,
    DONE: 0,
    REJECTED: 0,
    EXPIRED: 0,
    CANCELED: 0,
  };
  // check if datefrom is less than equal one day from today
  let isSplitByHour = false;
  if (queries.datefrom) {
    const dateFrom = new Date(queries.datefrom);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dateFrom.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      isSplitByHour = true;
    }
  }
  const today = new Date().toISOString().split("T")[0]; // Get the date part only
  transactions.forEach((transaction) => {
    let date = transaction.createdAt.toISOString().split("T")[0]; // Get the date part only
    if (isSplitByHour) {
      date = transaction.createdAt.toISOString();
    }

    const status = transaction.status;
    const quantity = transaction.transactionTicket.reduce(
      (acc, ticket) => acc + ticket.quantity,
      0
    );
    TotalGroupedTicket[status] += quantity;
    TotalGroupedTransactions[status] += 1;
    const existingGroup = groupedTransactions.find(
      (group) => group.date === date
    );
    const existingTicketGroup = groupedTicket.find(
      (group) => group.date === date
    );
    if (existingGroup) {
      existingGroup[status] += 1;
    } else {
      groupedTransactions.push({
        date,
        WAITING_FOR_PAYMENT: 0,
        WAITING_FOR_ADMIN_CONFIRMATION: 0,
        DONE: 0,
        REJECTED: 0,
        EXPIRED: 0,
        CANCELED: 0,
        [status]: 1,
      });
    }
    if (existingTicketGroup) {
      existingTicketGroup[status] += quantity;
    } else {
      groupedTicket.push({
        date,
        WAITING_FOR_PAYMENT: 0,
        WAITING_FOR_ADMIN_CONFIRMATION: 0,
        DONE: 0,
        REJECTED: 0,
        EXPIRED: 0,
        CANCELED: 0,
        [status]: quantity,
      });
    }
  });

  return {
    data: {
      transactions: groupedTransactions,
      tickets: groupedTicket,
      totalTransactions: TotalGroupedTransactions,
      totalTickets: TotalGroupedTicket,
    },

    message: "Transactions fetched successfully",
  };
};
