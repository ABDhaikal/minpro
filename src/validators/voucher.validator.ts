import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateCreateVoucher = [
  // Validasi nama voucher
  body("name")
    .isString()
    .notEmpty()
    .withMessage("voucher name cant be empty")
    .trim()
    .isLength({
      min: 3,
      max: 50,
    })
    .withMessage("Voucher name should 3 until 50 character"),

  body("amountDiscount")
    .notEmpty()
    .withMessage("discount cant be empty")
    .isInt({ min: 1 })
    .withMessage("Amount discount must be a positive integer"),

  body("quota")
    .notEmpty()
    .withMessage("quota cant be empty")
    .isInt({ min: 1 })
    .withMessage("Quota must be a positive integer"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required and must be a string")
    .isISO8601()
    .withMessage("Start date must be a valid date format")
    .toDate(),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required and must be a string")
    .isISO8601()
    .withMessage("End date must be a valid date format")
    .toDate()
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("End date cannot be earlier than start date");
      }
      return true;
    }),
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      throw new ApiError(firstError, 400);
    }

    next();
  },
];
export const validateUpdateVoucher = [
  // Validasi nama voucher
  body("name")
    .isString()
    .notEmpty()
    .withMessage("voucher name cant be empty")
    .trim()
    .isLength({
      min: 3,
      max: 50,
    })
    .withMessage("Voucher name should 3 until 50 character"),

  body("amountDiscount")
    .notEmpty()
    .withMessage("discount cant be empty")
    .isInt({ min: 1 })
    .withMessage("Amount discount must be a positive integer"),

  body("quota")
    .notEmpty()
    .withMessage("quota cant be empty")
    .isInt({ min: 1 })
    .withMessage("Quota must be a positive integer"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required and must be a string")
    .isISO8601()
    .withMessage("Start date must be a valid date format")
    .toDate(),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required and must be a string")
    .isISO8601()
    .withMessage("End date must be a valid date format")
    .toDate()
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("End date cannot be earlier than start date");
      }
      return true;
    }),
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      throw new ApiError(firstError, 400);
    }

    next();
  },
];
