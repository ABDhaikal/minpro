import { Worker } from "bullmq";
import prisma from "../../config/prisma";
import { redisConnection } from "../../lib/redis";
import { ApiError } from "../../utils/api-error";

export const userTransactionProofWorker = new Worker(
  "user-transaction-proof-queue",
  async (job) => {
    try {
      const { reciptNumber } = job.data;

      if (!reciptNumber) {
        console.error("Error processing transaction job:", 401);
      }

      const transaction = await prisma.transaction.findUnique({
        where: { reciptNumber: reciptNumber },
        include: {
          transactionTicket: true,
          cuponTransactions: true,
        },
      });

      if (!transaction) {
        throw new ApiError("Error processing transaction job:", 401);
      }

      if (transaction.status === "WAITING_FOR_ADMIN_CONFIRMATION") {
        await prisma.$transaction(async (tx) => {
          // kalau tidak update ke expired
          await tx.transaction.update({
            where: { reciptNumber: reciptNumber },
            data: { status: "CANCELED" },
          });

          // mengembalikan jumlah stock
          if (
            transaction.transactionTicket &&
            transaction.transactionTicket.length > 0
          ) {
            await Promise.all(
              transaction.transactionTicket.map(async (ticket) => {
                if (!ticket.quantity || ticket.quantity <= 0) {
                  throw new ApiError(
                    `Invalid ticket quantity for ticket ID: ${ticket.ticketId}`,
                    400
                  );
                }
                await tx.ticket.update({
                  where: { id: ticket.ticketId },
                  data: { buyed: { decrement: ticket.quantity } },
                });
              })
            );
          } else {
            throw new ApiError(`bad transaction no ticket to buy`, 400);
          }

          // balikin buyed voucher
          const validatingVoucher = await tx.voucherTransaction.findFirst({
            where: {
              transactionId: transaction.id,
            },
          });

          if (validatingVoucher) {
            const updateVoucherData = await tx.eventVoucher.update({
              where: {
                id: validatingVoucher.eventVoucherId,
              },
              data: {
                used: {
                  decrement: 1,
                },
              },
            });
            if (!updateVoucherData) {
              throw new ApiError("faied to restore voucher");
            }
          }

          // undeleted cupon
          if (
            transaction.cuponTransactions &&
            transaction.cuponTransactions.length > 0
          ) {
            await Promise.all(
              transaction.cuponTransactions.map(async (cupon) => {
                await tx.cuponDiscount.update({
                  where: { id: cupon.cuponDiscountId },
                  data: { used: { decrement: 1 } },
                });
              })
            );
          }

          // balikin point
          if (transaction.pointsUsed && transaction.pointsUsed > 0) {
            await tx.userPoint.update({
              where: {
                userId: transaction.userId,
              },
              data: { amount: { increment: transaction.pointsUsed } },
            });
          }
        });
      }
    } catch (error) {
      console.error("Error processing transaction job:", 401);
      throw error;
    }
  },
  { connection: redisConnection }
);
