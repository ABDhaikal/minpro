import { EventVoucher } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const createVoucherService = async (
  authID: string,
  EventID: string,
  data: EventVoucher
) => {
  const event = await prisma.event.findUnique({
    where: { id: EventID },
    include: {
      organizers: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError("Event not found", 404);
  }

  if (event.organizers.userId !== authID) {
    throw new ApiError("Forbidden", 403);
  }

  if (data.startDate >= data.endDate) {
    throw new ApiError("Voucher start date must be before voucher end date");
  }

  const validatingNameVoucher = await prisma.eventVoucher.findFirst({
    where: {
      eventId: EventID,
      name: data.name,
    },
  });

  if (validatingNameVoucher) {
    throw new ApiError("Voucher name already exists", 400);
  }

  const createdVoucher = await prisma.eventVoucher.create({
    data: {
      eventId: EventID,
      name: data.name,
      amountDiscount: data.amountDiscount,
      quota: data.quota,
      startDate: data.startDate,
      endDate: data.endDate,
      used: 0,
    },
  });
  return {
    message: "Voucher created successfully",
    data: createdVoucher,
  };
};
