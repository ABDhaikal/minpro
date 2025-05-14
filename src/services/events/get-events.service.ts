import { Category, Location, Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface GetEventsService extends PaginationQueryParams {
  search: string;
  category: string | null;
  location: string;
}

export const getEventsService = async (queries: GetEventsService) => {
  const { page, take, sortBy, sortOrder, search, category, location } = queries;

  const whereClause: Prisma.EventWhereInput = {};

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
  whereClause.deletedAt = null;
  whereClause.eventEnd = {
    gt: new Date(),
  };
  whereClause.status = "PUBLISH";
  const events = await prisma.event.findMany({
    where: whereClause,
    take: 10,
    skip: (page - 1) * take,
    orderBy: { [sortBy]: sortOrder },
  });

  const count = await prisma.event.count({ where: whereClause });

  return {
    data: events,
    meta: { page, take, total: count },
  };
};
