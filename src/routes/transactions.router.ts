import { Router } from "express";
import {
  acceptingTransactionController,
  createTransactionController,
  rejectingTransactionController,
  uploadPaymentProofController,
} from "../controllers/transactions.controller";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { verifyRole } from "../middlewares/role.middleware";
import { validateCreateTransaction } from "../validators/transaction.validator";
import { fileFilter } from "../lib/fileFilter";

const router = Router();

router.post(
  "/",
  verifyToken,
  validateCreateTransaction,
  createTransactionController
);

router.post(
  "/payment-proof/:reciptNumber",
  verifyToken,
  uploader().fields([{ name: "proofImage", maxCount: 1 }]),
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  uploadPaymentProofController
);

router.post(
  "/accepting/:reciptNumber",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  acceptingTransactionController
);

router.post(
  "/rejecting/:reciptNumber",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  rejectingTransactionController
);

export default router;
