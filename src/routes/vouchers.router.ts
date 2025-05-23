import { Router } from "express";
import {
  createVoucherController,
  deleteVoucherController,
  getVouchersByEventIdController,
  updateVoucherController,
} from "../controllers/vouchers.controller";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import {
  validateCreateVoucher,
  validateUpdateVoucher,
} from "../validators/voucher.validator";

const router = Router();

router.get("/:eventId", getVouchersByEventIdController);

router.post(
  "/:eventId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  validateCreateVoucher,
  createVoucherController
);

router.put(
  "/:voucherId",
  verifyToken,
  validateUpdateVoucher,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  updateVoucherController
);

router.delete(
  "/:voucherId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  deleteVoucherController
);

export default router;
