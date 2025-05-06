import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateCreateTicket = [
  body("name")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Ticket name is required and must be a non-empty string")
    .isLength({
      min: 3,
      max: 20,
    })
    .withMessage("Ticket name must be between 3 and 20 characters long")
    .matches(/^[a-zA-Z0-9 ]*$/)
    .withMessage("Ticket name must not contain special characters"),

  body("amount")
    .isInt({ min: 1 })
    .withMessage("Amount must be a positive integer"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive integer"),

  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      throw new ApiError(firstError, 400);
    }

    next();
  },
];

export const validateUpdateTicket = [
  body("name")
    .isString()
    .notEmpty()
    .trim()
    .withMessage("Ticket name is required and must be a non-empty string")
    .isLength({
      min: 3,
      max: 20,
    })
    .withMessage("Ticket name must be between 3 and 20 characters long")
    .matches(/^[a-zA-Z0-9 ]*$/)
    .withMessage("Ticket name must not contain special characters"),

  body("amount")
    .isInt({ min: 1 })
    .withMessage("Amount must be a positive integer"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive integer"),

  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      throw new ApiError(firstError, 400);
    }

    next();
  },
];
