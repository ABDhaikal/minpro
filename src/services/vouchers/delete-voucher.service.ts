import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteVoucherService = async (
  authID: string,
  voucherId: string
) => {
  const voucher = await prisma.eventVoucher.findUnique({
    where: { id: voucherId },
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
  if (voucher.used > 0) {
    throw new ApiError("Voucher already used, cant be delete", 400);
  }

  if (voucher.events.organizers.userId !== authID) {
    throw new ApiError("forbidden", 403);
  }

  if (voucher.deletedAt && voucher.events.status !== "DRAFT") {
    throw new ApiError("Voucher already deleted", 400);
  }

  if (voucher.events.status === "DRAFT") {
    const deletedVoucher = await prisma.eventVoucher.delete({
      where: { id: voucherId },
    });

    return {
      success: true,
      message: "Voucher deleted successfully",
      data: deletedVoucher,
    };
  } else {
    const deletedVoucher = await prisma.eventVoucher.update({
      where: { id: voucherId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Voucher deleted successfully",
      data: deletedVoucher,
    };
  }
};
