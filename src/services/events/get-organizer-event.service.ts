import { Category, Location, Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface GetEventsService extends PaginationQueryParams {
  search: string;
  category: string | null;
  location: string;
  date: string | null;
}

export const getOrganizerEventsService = async (
  authUserId: string,
  queries: GetEventsService
) => {
  const { page, take, sortBy, sortOrder, search, category, location } = queries;
  const whereClause: Prisma.EventWhereInput = {};

  const existingOrganizer = await prisma.organizer.findFirst({
    where: {
      users: {
        id: authUserId,
        role: "ADMIN",
      },
    },
  });
  if (!existingOrganizer) {
    throw new ApiError("Organizer not found", 404);
  }
  if (existingOrganizer.deletedAt) {
    throw new ApiError("Organizer not found", 404);
  }

  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };
  }
  if (location) {
    if (!Object.values(Location).includes(location as Location)) {
      throw new ApiError(`Invalid location: ${location}`, 404);
    }
    whereClause.location = { equals: location as Location };
  }

  if (category) {
    if (!Object.values(Category).includes(category as Category)) {
      throw new ApiError(`Invalid category: ${category}`, 404);
    }
    whereClause.category = { equals: category as Category };
  }

  if (queries.date) {
    if (isNaN(Date.parse(queries.date))) {
      throw new ApiError("Invalid date format", 400);
    }

    whereClause.eventStart = {
      lte: new Date(queries.date),
    };
    whereClause.eventEnd = {
      gte: new Date(queries.date),
    };
  }

  whereClause.deletedAt = null;
  whereClause.organizerId = existingOrganizer.id;

  const events = await prisma.event.findMany({
    where: whereClause,
    take: take,
    skip: (page - 1) * take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      _count: {
        select: {
          tickets: true,
          eventVoucher: true,
        },
      },
    },
  });

  const count = await prisma.event.count({ where: whereClause });

  return {
    data: events,
    meta: { page, take, total: count },
  };
};
