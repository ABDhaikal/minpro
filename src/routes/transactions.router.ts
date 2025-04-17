import { Router } from "express";
import { createTransactionController, uploadPaymentProofController } from "../controllers/transactions.controller";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import { validateCreateTransaction } from "../validators/transaction.validator";

const router = Router();

router.post(
  "/",
  verifyToken,
  verifyRole(["USER"]),
  validateCreateTransaction,
  createTransactionController
);

router.post(
    "/transactions/:id/payment-proof",
    verifyToken,
    verifyRole(["USER"]),
    uploadPaymentProofController
  );

export default router;
