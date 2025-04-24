import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateRegister = [
   body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isString()
      .trim()
      .withMessage("Username must be a string")
      .matches(/^[a-zA-Z0-9 ]*$/)
      .withMessage("Username must not contain special characters")
      .isLength({ min: 3, max: 20 })
      .withMessage("Username must be between 3 and 20 characters long"),
   body("email")
      .notEmpty()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Email is invalid")
      .toLowerCase(),
   body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isString()
      .withMessage("Password must be a string")
      .isStrongPassword({
         minLength: 8,
         minLowercase: 1,
         minUppercase: 1,
         minNumbers: 1,
         minSymbols: 0,
      })
      .withMessage(
         "Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number"
      ),
   (req: Request, res: Response, next: NextFunction) => {
      const err = validationResult(req);
      if (!err.isEmpty()) {
         throw new ApiError(err.array()[0].msg, 400);
      }
      next();
   },
];

export const validateLogin = [
   body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Email is invalid")
      .toLowerCase(),
   body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isString()
      .withMessage("Password must be a string"),
   (req: Request, res: Response, next: NextFunction) => {
      const err = validationResult(req);
      if (!err.isEmpty()) {
         throw new ApiError(err.array()[0].msg, 400);
      }
      next();
   },
];

export const validateRegisterOrganizer = [
   body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string")
      .trim()
      .matches(/^[a-zA-Z0-9 ]*$/)
      .withMessage("Name must not contain special characters")
      .isLength({ min: 3, max: 20 })
      .withMessage("Name must be between 3 and 20 characters long"),
   body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isString()
      .withMessage("Description must be a string")
      .isLength({ min: 3, max: 500 })
      .withMessage("Description must be between 3 and 500 characters long"),
   body("bankTarget")
      .notEmpty()
      .withMessage("Bank Name is required")
      .isString()
      .withMessage("Bank target must be a string")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Bank target must be between 3 and 20 characters long")
      .toUpperCase(),
   body("paymentTarget")
      .notEmpty()
      .withMessage("Payment target is required")
      .toInt()
      .isNumeric()
      .withMessage("Payment target is required and must be a number"),
   (req: Request, res: Response, next: NextFunction) => {
      const err = validationResult(req);
      if (!err.isEmpty()) {
         throw new ApiError(err.array()[0].msg, 400);
      }

      next();
   },
];
