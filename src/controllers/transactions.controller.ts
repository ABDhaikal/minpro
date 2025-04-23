import { Request, Response, NextFunction } from "express";
import { createTransactionService } from "../services/transactions/create-transaction.service";
import { uploadPaymentProofService } from "../services/transactions/upload-proof-payment.service";
import multer from "multer";
import { ApiError } from "../utils/api-error";
import { getTransactionsService } from "../services/transactions/get-transactions.service";
import { acceptingTransactionService } from "../services/transactions/accepting-transaction.service";
import { rejectingTransactionService } from "../services/transactions/rejecting-transaction.service";

export const getTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getTransactionsService({
      userId,
      page: Number(page),
      limit: Number(limit),
    });
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const createTransactionController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const result = await createTransactionService(
         req.body,
         String(res.locals.user.id)
      );
      res.status(200).send(result);
   } catch (error) {
      next(error);
   }
};

export const uploadPaymentProofController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const file = req.file as Express.Multer.File;

      if (!file) {
         throw new ApiError("No file uploaded", 400);
      }

      const { transactionId } = req.params;
      const authUserId = res.locals.user.id;

      const result = await uploadPaymentProofService(
         transactionId,
         authUserId,
         file
      );

      res.status(201).send(result);
   } catch (error: any) {
      next(error);
   }
};

export const acceptingTransactionController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const { reciptNumber } = req.params;
      const authUserId = res.locals.user.id;

      const result = await acceptingTransactionService(
         reciptNumber,
         authUserId
      );

      res.status(200).send(result);
   } catch (error) {
      next(error);
   }
};

export const rejectingTransactionController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const { reciptNumber } = req.params;
      const authUserId = res.locals.user.id;

      const result = await rejectingTransactionService(
         reciptNumber,
         authUserId
      );

      res.status(200).send(result);
   } catch (error) {
      next(error);
   }
};
