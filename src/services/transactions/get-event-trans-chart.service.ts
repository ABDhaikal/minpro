import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface IGetEventTransChartService {
  datefrom: string | null;
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
  eventid: string,
  queries: IGetEventTransChartService
) => {
  console.log("eventid", eventid);
  const existingEvent = await prisma.event.findUnique({
    where: {
      id: eventid,
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
    console.log("event not found", existingEvent);
    throw new ApiError("Event not found ", 404);
  }
  if (existingEvent.organizers.users.id !== authUserId) {
    throw new ApiError("Unauthorized to access this event", 401);
  }

  const whereClauseTransaction: Prisma.TransactionWhereInput = {};
  whereClauseTransaction.deletedAt = null;
  whereClauseTransaction.transactionTicket = {
    some: {
      tickets: {
        eventId: eventid,
        deletedAt: null,
      },
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

  // check if datefrom is less than equal one day from today
  let isSplitByHour = false;
  console.log("data.datefrom", queries.datefrom);
  if (queries.datefrom) {
    const dateFrom = new Date(queries.datefrom);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dateFrom.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      isSplitByHour = true;
      console.log("isSplitByHour", isSplitByHour);
    }
  }
  const today = new Date().toISOString().split("T")[0]; // Get the date part only
  transactions.forEach((transaction) => {
    let date = transaction.createdAt.toISOString().split("T")[0]; // Get the date part only
    if (isSplitByHour) {
      const timeParts = transaction.createdAt.toISOString().split(":");
      date = timeParts.slice(0, timeParts.length - 2).join(":"); // Remove the last index and join back
    }

    
    const status = transaction.status;
    const quantity = transaction.transactionTicket.reduce(
      (acc, ticket) => acc + ticket.quantity,
      0
    );

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
        [status]: quantity,
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
    data: { transactions: groupedTransactions, ticket: groupedTicket },

    message: "Transactions fetched successfully",
  };
};
