import { Router } from "express";
import {
  acceptingTransactionController,
  createTransactionController,
  getEventTransactionController,
  getEventTransChartController,
  getOrgTransDetailController,
  getUserPointController,
  rejectingTransactionController,
  uploadPaymentProofController,
} from "../controllers/transactions.controller";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { verifyRole } from "../middlewares/role.middleware";
import { validateCreateTransaction } from "../validators/transaction.validator";
import { fileFilter } from "../lib/fileFilter";

const router = Router();

router.get("/point", verifyToken, getUserPointController);
router.get(
  "/chart/:eventid",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getEventTransChartController
);
router.get(
  "/detail/:reciptNumber",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getOrgTransDetailController
);

router.get(
  "/:eventid",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getEventTransactionController
);

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
