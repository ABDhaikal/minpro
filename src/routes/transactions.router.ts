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
import multer from "multer";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
   "/",
   verifyToken,
   validateCreateTransaction,
   createTransactionController
);

router.post(
   "/payment-proof/:transactionId",
   verifyToken,
   upload.single("imageTransaction"),
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
