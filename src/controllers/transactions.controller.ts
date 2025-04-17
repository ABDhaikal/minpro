import { Request, Response, NextFunction } from "express";
import { createTransactionService } from "../services/transactions/create-transaction.service";
import { uploadPaymentProofService } from "../services/transactions/upload-proof-payment.service";

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
        const { id } = req.params;
        const authUserId = String(req.locals.user.id);
        const paymentProofFile = req.body.paymentProof;
    
        const result = await uploadPaymentProofService(id, authUserId, paymentProofFile);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };