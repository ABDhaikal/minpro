import { Worker } from "bullmq";
import { redisConnection } from "../../lib/redis";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { body } from "express-validator";

export const userTransactionWorker = new Worker(
  "user-transaction-queue",
  async (job) => {
    try {
      console.log("worker jalan");
      const uuid = job.data.uuid;

      if (!uuid) {
        throw new ApiError("Invalid job data: missing UUID", 400);
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: uuid },
        include: {
          transactionTicket: true,
          cuponTransactions: true,
        },
      });

      if (!transaction) {
        throw new ApiError("Invalid transaction UUID", 400);
      }

      if (transaction.status === "WAITING_FOR_PAYMENT") {
        await prisma.$transaction(async (tx) => {
          // kalau tidak update ke expired
          await tx.transaction.update({
            where: { id: uuid },
            data: { status: "EXPIRED" },
          });

          // mengembalikan jumlah stock
          if (
            transaction.transactionTicket &&
            transaction.transactionTicket.length > 0
          ) {
            await Promise.all(
              transaction.transactionTicket.map(async (ticket) => {
                if (!ticket.amount || ticket.amount <= 0) {
                  throw new ApiError(
                    `Invalid ticket amount for ticket ID: ${ticket.ticketId}`,
                    400
                  );
                }
                await tx.ticket.update({
                  where: { id: ticket.ticketId },
                  data: { buyed: { decrement: ticket.amount } },
                });
              })
            );
          } else {
            throw new ApiError(`bad transaction no ticket to buy`, 400);
          }

          // balikin buyed voucher
          const validatingVoucher = await tx.voucherTransaction.findFirst({
            where: {
              transactionId: uuid,
            },
          });

          if (validatingVoucher) {
            const updateVoucherData = tx.eventVoucher.update({
              where: {
                id: validatingVoucher.eventVoucherId,
              },
              data: {
                used: {
                  increment: 1,
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
            for (const cupon of transaction.cuponTransactions) {
              await tx.cuponDiscount.update({
                where: { id: cupon.cuponId },
                data: { deletedAt: null },
              });
            }
          }

          // balikin point
          if (transaction.pointsUsed && transaction.pointsUsed > 0) {
            await tx.user.update({
              where: {
                id: transaction.userId,
              },
              data: { point: { increment: transaction.pointsUsed } },
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
