import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface IGetEventTransactionService extends PaginationQueryParams {
  search: string;
  date: string | null;
  ticket: string;
}

export const getEventTransactionService = async (
  eventid: string,
  authUserId: string,
  queries: IGetEventTransactionService
) => {
  // validating event id
  const existingEvent = await prisma.event.findFirst({
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
    throw new ApiError("Event not found ", 404);
  }
  if (existingEvent.organizers.users.id !== authUserId) {
    throw new ApiError("Unauthorized to access this event", 401);
  }

  // validating query
  const { page, take, sortBy, sortOrder, search, date } = queries;
  const whereClauseTransaction: Prisma.TransactionWhereInput = {};

  whereClauseTransaction.transactionTicket = {
    some: {
      tickets: {
        eventId: eventid,
        deletedAt: null,
      },
    },
  };

  if (search) {
    whereClauseTransaction.users = {
      username: { contains: search, mode: "insensitive" },
    };
  }

  if (queries.ticket) {
    whereClauseTransaction.transactionTicket = {
      some: {
        tickets: {
          name: { contains: queries.ticket, mode: "insensitive" },
        },
      },
    };
  }

  if (queries.date) {
    if (isNaN(Date.parse(queries.date))) {
      throw new ApiError("Invalid date format", 400);
    }

    whereClauseTransaction.updatedAt = {
      gte: new Date(queries.date),
      lte: new Date(new Date(queries.date).setHours(23, 59, 59)),
    };
  }

  whereClauseTransaction.deletedAt = null;

  const eventTransaction = await prisma.transaction.findMany({
    where: whereClauseTransaction,
    take: take || 10, // Default to 10 if take is not provided
    skip: ((page || 1) - 1) * (take || 10), // Default to page 1 if not provided
    orderBy: sortBy ? { [sortBy]: sortOrder || "asc" } : undefined, // Default to ascending order if sortOrder is not provided

    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          profilePict: true,
        },
      },
      transactionTicket: {
        select: {
          quantity: true,
          tickets: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!eventTransaction) {
    throw new ApiError("Event transaction not found", 404);
  }

  // Flatten the transaction ticket data into a one-dimensional object
  const flattenedTransactions = eventTransaction.map((transaction) => ({
    id: transaction.id,
    receiptNumber: transaction.reciptNumber,
    status: transaction.status,
    paymentProof: transaction.paymentProof,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    totalPrice: transaction.totalPrice,
    userId: transaction.users.id,
    username: transaction.users.username,
    email: transaction.users.email,
    profilePict: transaction.users.profilePict,
    tickets: transaction.transactionTicket.map((ticket) => ({
      ticketName: ticket.tickets.name,
      quantity: ticket.quantity,
    })),
  }));

  return {
    data: flattenedTransactions,
    meta: {
      page,
      take,
      total: await prisma.transaction.count({
        where: whereClauseTransaction,
      }),
    },
  };
};
