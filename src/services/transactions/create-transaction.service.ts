import { Transaction, TransactionStatus } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { Backoffs } from "bullmq";
import { userTransactionQueue } from "../../jobs/queue/transaction.queue";

export const createTransactionService = async (
  body: Pick<Transaction, "pointsUsed" | "totalPrice" | "paymentDeadline">,
  authUserId: string
) => {
    
  if (!body.pointsUsed || !body.totalPrice || !body.paymentDeadline) {
    throw new ApiError("Invalid input data", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: authUserId },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const newTransaction = await prisma.$transaction(async (tx) => {
    //kalo user mau pake point??
    if (body.pointsUsed > 0) {
      const updatedUser = await tx.user.update({
        where: { id: authUserId },
        data: { point: { decrement: body.pointsUsed } },
      });

      if (updatedUser.point < 0) {
        throw new ApiError("Insufficient points", 400);
      }
    }

    return await tx.transaction.create({
      data: {
        userId: authUserId,
        status: TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION, //tidak ada PENDING??
        pointsUsed: body.pointsUsed,
        totalPrice: body.totalPrice,
        paymentDeadline: body.paymentDeadline,
      },
    });
  });

  await userTransactionQueue.add(
    "new-transaction",
    {
      uuid: newTransaction.id,
    },
    {
      jobId: newTransaction.id,
      delay: 2 * 60000,
      removeOnComplete: true,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );

  return { messaage: "Transaction created successfully", data: newTransaction };
};
