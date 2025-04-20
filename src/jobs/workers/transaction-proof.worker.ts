import { Worker } from "bullmq";
import { redisConnection } from "../../lib/redis";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryUpload } from "../../lib/cloudinary";

export const userTransactionProofWorker = new Worker(
  "user-transaction-proof-queue",
  async (job) => {
    try {
      const { transactionId, imageTransactionFile } = job.data;

      if (!transactionId || !imageTransactionFile) {
        throw new ApiError("Invalid job data", 400)
      }
      const uploadImage = await cloudinaryUpload(
        imageTransactionFile,
        "payment-proofs"
      );
      const secureUrl = uploadImage.secure_url;

      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          paymentProof: secureUrl,
          status: "WAITING_FOR_ADMIN_CONFIRMATION",
        },
      });
    } catch (error) {
      console.error("Error processing transaction job:", 401);
      throw error;
    }
  },
  { connection: redisConnection }
);
