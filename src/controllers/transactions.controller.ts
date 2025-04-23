import { Request, Response, NextFunction } from "express";
import { createTransactionService } from "../services/transactions/create-transaction.service";
import { uploadPaymentProofService } from "../services/transactions/upload-proof-payment.service";
import multer from "multer";
import { ApiError } from "../utils/api-error";
import { getTransactionsService } from "../services/transactions/get-transactions.service";

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
    const { transactionId } = req.params;
    const authUserId = res.locals.user.id;
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] })["paymentProof"]?.[0];


    const result = await uploadPaymentProofService(
      transactionId,
      authUserId,
      files
    );

    res.status(201).send(result);
  } catch (error: any) {
    next(error);
  }
};
