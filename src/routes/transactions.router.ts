import { Router } from "express";
import { createTransactionController, uploadPaymentProofController } from "../controllers/transactions.controller";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import { validateCreateTransaction } from "../validators/transaction.validator";
import multer from "multer"


const router = Router();

const upload = multer({storage: multer.memoryStorage()})

router.post(
  "/",
  verifyToken,
  verifyRole(["USER"]),
  validateCreateTransaction,
  createTransactionController
);

router.post(
    "/transactions/:transactioId/payment-proof",
    verifyToken,
    verifyRole(["USER"]),
    upload.single("imageTransaction"),
    uploadPaymentProofController
  );

export default router;
