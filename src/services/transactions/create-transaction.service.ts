import { TransactionStatus } from "@prisma/client";
import {
  EXPIRED_ADMIN_CONFIRM_DEADLINE_DAY,
  EXPIRED_PAYMENT_DEADLINE_HOUR,
} from "../../config/env";
import prisma from "../../config/prisma";
import { userTransactionQueue } from "../../jobs/queue/transaction.queue";
import { ApiError } from "../../utils/api-error";
import { userTransactionProofQueue } from "../../jobs/queue/transaction-proof.queue";

interface Iticket {
  ticketId: string;
  amount: number;
}

interface ICreateTransactionService {
  cuponID: string[] | undefined;
  voucherID: string | undefined;
  tickets: Iticket[];

  pointsUsed: number | undefined;
}

export const createTransactionService = async (
  body: ICreateTransactionService,
  authUserId: string
) => {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: authUserId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let pointExpiredAt = new Date();
    if (body.pointsUsed) {
      const userPoint = await tx.userPoint.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!userPoint || userPoint.amount < body.pointsUsed) {
        throw new ApiError("User doesnt have enough point", 400);
      }
      pointExpiredAt = userPoint.expiredAt;
    } else {
      body.pointsUsed = 0;
    }

    let discountPercent = 0;
    let discountdecrease = 0;

    if (body.cuponID && body.cuponID.length > 0) {
      await Promise.all(
        body.cuponID.map(async (cuponWant2use) => {
          const data = await tx.cuponDiscount.findFirst({
            where: {
              userId: authUserId,
              id: cuponWant2use,
              expiredAt :{
                gte: new Date(),
              },
              deletedAt: null,
            },
          });

          if (!data) {
            throw new ApiError("Cupon not found", 404);
          }
          if (data.used >= data.quantity) {
            throw new ApiError("Cupon has reached its limit", 403);
          }

          if (data.type === "FIXED_AMOUNT") {
            discountdecrease += data.amount;
          }
          if (data.type === "PERCENTAGE") {
            discountPercent =
              discountPercent + ((100 - discountPercent) * data.amount) / 100;
          }
          await tx.cuponDiscount.update({
            where: {
              id: data.id,
            },
            data: { used: { increment: 1 } },
          });
        })
      );
    }

    let PriceBeforDiscount = 0;
    let eventid = "";
    await Promise.all(
      body.tickets.map(async (ticketsFinding) => {
        if (ticketsFinding.amount <= 0) {
          throw new ApiError("Ticket amount must be greater than 0", 400);
        }
        const data = await tx.ticket.findFirst({
          where: { id: ticketsFinding.ticketId, deletedAt: null },
          include: {
            events: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });
        if (!data) {
          throw new ApiError("Ticket not found", 404);
        }
        const available = data.amount - data.buyed;
        if (available < ticketsFinding.amount) {
          throw new ApiError("Ticket not available", 403);
        }
        if (eventid === "") {
          eventid = data.events.id as string;
        } else if (data.events.id !== eventid) {
          throw new ApiError(
            "system not provide buying ticket with different event"
          );
        }
        if (data.events.status !== "PUBLISH") {
          throw new ApiError("event not avilable to buy", 403);
        }

        await tx.ticket.update({
          where: {
            id: data.id,
          },
          data: {
            buyed: {
              increment: ticketsFinding.amount,
            },
          },
        });
        PriceBeforDiscount += ticketsFinding.amount * data.price;
      })
    );

    if (body.voucherID && body.voucherID !== "") {
      if (typeof body.voucherID !== "string") {
        throw new ApiError("voucher id must be string");
      }

      const validatingVoucher = await tx.eventVoucher.findFirst({
        where: {
          id: body.voucherID,
          deletedAt: null,
        },
      });

      if (!validatingVoucher) {
        throw new ApiError("voucher not found", 404);
      }

      if (validatingVoucher.quota === validatingVoucher.used) {
        throw new ApiError("voucher is sold", 404);
      }

      if (validatingVoucher.eventId !== eventid) {
        throw new ApiError("voucher not provide for this transaction", 400);
      }

      if (
        validatingVoucher.startDate > new Date() ||
        validatingVoucher.endDate < new Date()
      ) {
        throw new ApiError("voucher is not available in this time", 400);
      }

      await tx.eventVoucher.update({
        where: {
          id: body.voucherID,
        },
        data: {
          used: {
            increment: 1,
          },
        },
      });

      discountdecrease += validatingVoucher.amountDiscount;
    }
    let PriceAfterDiscount =
      (PriceBeforDiscount * (100 - discountPercent)) / 100;
    if (body.pointsUsed && PriceAfterDiscount - discountdecrease <= 0) {
      body.pointsUsed = 0;
      PriceAfterDiscount = 0;
    } else {
      PriceAfterDiscount = PriceAfterDiscount - discountdecrease;
    }

    if (body.pointsUsed && PriceAfterDiscount - body.pointsUsed < 0) {
      body.pointsUsed = PriceAfterDiscount;
      PriceAfterDiscount = 0;
    } else if (body.pointsUsed) {
      PriceAfterDiscount -= body.pointsUsed;
    }

    if (body.pointsUsed && body.pointsUsed > 0) {
      await tx.userPoint.update({
        where: { userId: authUserId },
        data: {
          amount: {
            decrement: body.pointsUsed,
          },
        },
      });
    }

    let statusTransaction = "WAITING_FOR_PAYMENT";
    if (PriceAfterDiscount <= 0) {
      statusTransaction = "WAITING_FOR_ADMIN_CONFIRMATION";
    }
    const newTransaction = await tx.transaction.create({
      data: {
        userId: authUserId,
        pointsUsed: body.pointsUsed,
        pointsExpiredAt: pointExpiredAt,
        totalPriceBeforeDiscount: PriceBeforDiscount,
        totalPrice: PriceAfterDiscount,
        totalDecreaseDiscount: discountdecrease,
        status: statusTransaction as TransactionStatus,
        totalPercentDiscount: discountPercent,
        paymentDeadline: new Date(
          Date.now() + EXPIRED_PAYMENT_DEADLINE_HOUR * 60 * 60 * 1000
        ),
      },
    });
    if (!newTransaction) {
      throw new ApiError("Failed to create transaction", 501);
    }

    if (body.voucherID) {
      const createVoucherTransaction = await tx.voucherTransaction.create({
        data: {
          transactionId: newTransaction.id,
          eventVoucherId: body.voucherID,
        },
      });
      if (!createVoucherTransaction) {
        throw new ApiError("Failed to create voucher transaction", 501);
      }
    }

    await Promise.all(
      body.tickets.map(async (ticket) => {
        const data = await tx.ticket.findFirst({
          where: { id: ticket.ticketId, deletedAt: null },
        });
        if (!data) {
          throw new ApiError("Ticket not found", 404);
        }

        const createTicket = await tx.transactionTicket.create({
          data: {
            transactionId: newTransaction.id,
            ticketId: ticket.ticketId,
            quantity: ticket.amount,
            price: data.price,
          },
        });
        if (!createTicket) {
          throw new ApiError("Failed to create voucher transaction", 501);
        }
      })
    );

    if (body.cuponID && body.cuponID.length > 0) {
      await Promise.all(
        body.cuponID.map(async (cuponWant2use) => {
          const data = await tx.cuponDiscount.findFirst({
            where: {
              userId: authUserId,
              id: cuponWant2use,
              deletedAt: null,
            },
          });
          if (!data) {
            throw new ApiError("Cupon not found", 404);
          }
          const createCupon = await tx.cuponTransaction.create({
            data: {
              cuponDiscountId: cuponWant2use,
              transactionId: newTransaction.id,
              amount: data.amount,
              type: data.type,
            },
          });
          if (!createCupon) {
            throw new ApiError("Failed to create cupon transaction", 501);
          }
        })
      );
    }
    if (PriceAfterDiscount > 0) {
      await userTransactionQueue.add(
        "new-transaction",
        {
          reciptNumber: newTransaction.reciptNumber,
        },
        {
          jobId: newTransaction.id,
          delay: EXPIRED_PAYMENT_DEADLINE_HOUR * 60 * 60 * 1000,
          removeOnComplete: true,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );
    } else {
      await userTransactionProofQueue.add(
        "uploadPaymentproof",
        {
          reciptNumber: newTransaction.reciptNumber,
        },
        {
          jobId: newTransaction.reciptNumber,
          delay: EXPIRED_ADMIN_CONFIRM_DEADLINE_DAY * 24 * 60 * 60 * 1000,
          removeOnComplete: true,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );
    }

    return {
      messaage: "Transaction created successfully wait payment proof in 2 hour",
    };
  });

  return result;
};
