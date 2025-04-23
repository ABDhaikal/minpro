import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateCreateVoucher = [

  // Validasi nama voucher
  body("name")
    .isString()
    .notEmpty()
    .trim() // Menghapus spasi di awal dan akhir string
    .withMessage("Voucher name is required and must be a non-empty string"),

  body("amountDiscount")
    .isInt({ min: 1 })
    .withMessage("Amount discount must be a positive integer"),

  body("quota")
    .isInt({ min: 1 })
    .withMessage("Quota must be a positive integer"),

  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      throw new ApiError(firstError, 400);
    }

    next();
  },
];