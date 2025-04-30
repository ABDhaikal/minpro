import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateUpdateUserProfile = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  body("username").notEmpty().withMessage("username is required"),
  (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      throw new ApiError(err.array()[0].msg, 400);
    }

    next();
  },
];

export const validateUpdateName = [
  body("username")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .trim()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 20 })
    .withMessage("Name must be between 3 and 20 characters long"),
  (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      throw new ApiError(err.array()[0].msg, 400);
    }

    next();
  },
];

export const validateUpdateEmail = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      throw new ApiError(err.array()[0].msg, 400);
    }

    next();
  },
];  