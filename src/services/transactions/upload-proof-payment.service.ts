import prisma from "../../config/prisma";
import { userTransactionProofQueue } from "../../jobs/queue/transaction-proof.queue";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const uploadPaymentProofService = async (
  transactionId: string,
  authUserId: string,
  imageTransactionFile: Express.Multer.File
) => {
  try {
    if (!imageTransactionFile) {
      throw new ApiError("Payment proof is required", 400);
    }
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 400);
    }

    if (transaction.userId !== authUserId) {
      throw new ApiError("Unauthorized", 401);
    }

    if (transaction.status !== "WAITING_FOR_PAYMENT") {
      throw new ApiError(
        "Cannot Upload payment proof for this transaction",
        400
      );
    }

    const { secure_url } = await cloudinaryUpload(
      imageTransactionFile,
      "paymentProof"
    );

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { paymentProof: secure_url },
    });

    await userTransactionProofQueue.add("uploadPaymentproof", {
      transactionId,
      imageTransactionFile,
    });
    return {
      message: "Payment proof uploaded succesfully",
      data: updatedTransaction,
    };
  } catch (error) {
    console.error("Error uploading payment proof", error);

    if (error instanceof ApiError) {
      throw error;
    }
  }
  throw new ApiError("Failed to upload payment proof", 500);
};
