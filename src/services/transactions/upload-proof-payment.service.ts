import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const uploadPaymentProofService = async (
  id: string,
  authUserId: string,
  paymentProofFile: string
) => {
  try {
    // Cek transaksi berdasarkan UUID
    const transaction = await prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new ApiError("Invalid transaction uuid", 400);
    }

    if (transaction.userId !== authUserId) {
      throw new ApiError("Unauthorized", 401);
    }
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    throw new ApiError("Failed to upload payment proof", 500);
  }
  await prisma.transaction.update({
    where: { id },
    data: { status: "WAITING_FOR_PAYMENT" },
  });

  return { message: "upload payment success" };
};
