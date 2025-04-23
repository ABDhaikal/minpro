import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

export const getVouchersByEventIdService = async (eventId: string) => {
  if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
    throw new ApiError(
      "Event ID is required and must be a non-empty string",
      400
    );
  }

  const vouchers = await prisma.eventVoucher.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  if (!vouchers || vouchers.length === 0) {
    throw new ApiError("No vouchers found for this event", 404);
  }

  return {
    message: "Vouchers retrieved successfully",
    data: vouchers,
  };
};
