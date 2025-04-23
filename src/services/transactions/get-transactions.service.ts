import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface IGetTransactionsService {
  userId: string;
  page: number;
  limit: number;
}

export const getTransactionsService = async ({
  userId,
  page,
  limit,
}: IGetTransactionsService) => {
  const skip = (page - 1) * limit;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" }, // Order by most recent
    include: {
      transactionTicket: {
        select: {
          ticketId: true,
          amount: true,
          price: true,
        },
      },
      voucherTransaction: {
        select: {
          eventVoucherId: true,
        },
      },
      cuponTransactions: {
        select: {
          cuponDiscountId: true,
          amount: true,
          type: true,
        },
      },
    },
  });

  if (!transactions || transactions.length === 0) {
    throw new ApiError("No transactions found for this user", 404);
  }

  return {
    transactions,
    message: "Transactions fetched successfully",
  };
};
