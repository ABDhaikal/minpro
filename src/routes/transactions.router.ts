import { Router } from "express";
import multer from "multer";
import {
  createTransactionController,
  getTransactionController,
  uploadPaymentProofController,
} from "../controllers/transactions.controller";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { verifyRole } from "../middlewares/role.middleware";
import { validateCreateTransaction } from "../validators/transaction.validator";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:userId", getTransactionController);

router.post(
  "/create-transaction",
  verifyToken,
  validateCreateTransaction,
  createTransactionController
);

router.post(
  "/:transactionId/payment-proof",
  uploader().single("paymentProof"),
  uploadPaymentProofController
);

export default router;
