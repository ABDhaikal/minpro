import { EXPIRED_ADMIN_CONFIRM_DEADLINE_DAY } from "../../config/env";
import prisma from "../../config/prisma";
import { userTransactionProofQueue } from "../../jobs/queue/transaction-proof.queue";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const uploadPaymentProofService = async (
  reciptNumber: string,
  authUserId: string,
  imageTransactionFile: Express.Multer.File
) => {
  if (!imageTransactionFile) {
    throw new ApiError("Payment proof is required", 400);
  }
  const transaction = await prisma.transaction.findUnique({
    where: { reciptNumber: reciptNumber },
  });

  if (!transaction) {
    throw new ApiError("Transaction not found", 400);
  }

  if (transaction.userId !== authUserId) {
    throw new ApiError("Unauthorized", 401);
  }

  if (transaction.status !== "WAITING_FOR_PAYMENT") {
    throw new ApiError("Cannot Upload payment proof for this transaction", 400);
  }

  const { secure_url } = await cloudinaryUpload(
    imageTransactionFile,
    "paymentProof"
  );

  if (!secure_url) {
    throw new ApiError("Failed to upload payment proof", 500);
  }
  const updatedTransaction = await prisma.transaction.update({
    where: { reciptNumber: reciptNumber },
    data: {
      paymentProof: secure_url,
      status: "WAITING_FOR_ADMIN_CONFIRMATION",
    },
  });

  await userTransactionProofQueue.add(
    "uploadPaymentproof",
    {
      reciptNumber: reciptNumber,
    },
    {
      jobId: reciptNumber,
      delay: EXPIRED_ADMIN_CONFIRM_DEADLINE_DAY * 24 * 60 * 60 * 1000,
      removeOnComplete: true,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );

  return {
    message: `Payment proof uploaded succesfully waiting admin confirmation in ${EXPIRED_ADMIN_CONFIRM_DEADLINE_DAY} days`,
    data: updatedTransaction,
  };
};
