import prisma from "../../config/prisma";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const uploadPaymentProofService = async (
  transactionId: string,
  authUserId: string,
  imageTransactionFile: Express.Multer.File
) => {
  try {
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

    let secureUrl: string;
    try {
      const uploadResult = await cloudinaryUpload(
        imageTransactionFile,
        "payment-proofs"
      );
      secureUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      throw new ApiError("Failed to upload payment proof to Cloudinary", 500);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: secureUrl,
        status: "WAITING_FOR_ADMIN_CONFIRMATION",
      },
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
