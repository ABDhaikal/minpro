import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";

interface GetEventsService extends PaginationQueryParams {
  search: string;
}
export const getEventsService = async (queries: GetEventsService) => {
  const { page, take, sortBy, sortOrder, search } = queries;

  const whereClause: Prisma.EventWhereInput = {};

  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };

  const events = await prisma.event.findMany({
    where: whereClause,
    take: take,
    skip: (page - 1) * take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      Image: {
        where: {
          isThumbnail: true,
        },
        select: {
          imageUrl: true,
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
