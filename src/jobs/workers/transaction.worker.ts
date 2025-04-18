import { Worker } from "bullmq";
import { redisConnection } from "../../lib/redis";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const userTransactionWorker = new Worker(
  "user-transaction-queue",
  async (job) => {
    try {
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
            for (const ticket of transaction.transactionTicket) {
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
            }
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
