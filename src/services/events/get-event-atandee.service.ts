import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface getAttQuery extends PaginationQueryParams {
  search: string;
  ticket: string;
}

export const getEventAtendeeService = async (
  authid: string,
  eventid: string,
  query: getAttQuery
) => {
  const existingOrganizer = await prisma.organizer.findFirst({
    where: {
      users: {
        id: authid,
        role: "ADMIN",
      },
      deletedAt: null,
    },
  });

  if (!existingOrganizer) {
    throw new ApiError("Organizer not found", 404);
  }

  const existingEvent = await prisma.event.findFirst({
    where: {
      id: eventid,
      deletedAt: null,
    },
  });
  if (!existingEvent) {
    throw new ApiError("Event not Found", 404);
  }

  if (existingEvent.organizerId !== existingOrganizer.id) {
    throw new ApiError("Event not Found", 404);
  }

  const { page, take, sortBy, sortOrder, search, ticket } = query;
  const whereClause: Prisma.UserEventTicketWhereInput = {};
  if (ticket) {
    whereClause.ticket = {
      name: ticket,
    };
  }

  whereClause.deletedAt = null;
  whereClause.usersEvent = {
    eventId: eventid,
    deletedAt: null,
    user: {
      username: { contains: search, mode: "insensitive" },
      deletedAt: null,
    },
  };
  const data = await prisma.userEventTicket.findMany({
    where: whereClause,
    take: take,
    skip: (page - 1) * take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      ticket: {
        select: {
          name: true,
        },
      },
      usersEvent: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePict: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    throw new ApiError("no data", 404);
  }
  const count = await prisma.userEventTicket.count({ where: whereClause });

  return {
    data: data,
    meta: { page, take, total: count },
    message: "Atendee event retrieved successfully",
  };
};
