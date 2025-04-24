import { EventVoucher } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const updateVoucherService = async (
  authID: string,
  voucherId: string,
  data: Omit<EventVoucher, "used">
) => {
  const voucher = await prisma.eventVoucher.findFirst({
    where: {
      id: voucherId,
    },
    include: {
      events: {
        select: {
          status: true,
          organizers: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!voucher) {
    throw new ApiError("Voucher not found", 404);
  }
  if (voucher.events.organizers.userId !== authID) {
    throw new ApiError("Forbidden", 403);
  }
  const validatingNameVoucher = await prisma.eventVoucher.findFirst({
    where: {
      eventId: voucher.eventId,
      name: data.name,
    },
  });

  if (validatingNameVoucher && validatingNameVoucher.id !== data.id) {
    throw new ApiError("Voucher name already exists", 400);
  }

  if (data.startDate >= data.endDate) {
    throw new ApiError("Voucher start date must be before voucher end date");
  }

  if (voucher.used > data.quota) {
    throw new ApiError("Voucher quota exceeded", 400);
  }

  const updatedVoucher = await prisma.eventVoucher.update({
    where: {
      id: voucherId,
    },
    data: {
      name: data.name,
      amountDiscount: data.amountDiscount,
      quota: data.quota,
      startDate: data.startDate,
      endDate: data.endDate
    },
  });

  return {
    message: "Voucher updated successfully",
    data: updatedVoucher,
  };
};
