import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateRegister = [
   body("userData.email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
   body("userData.password")
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
      const requeredFields = [
         "name",
         "description",
         "bankTarget",
         "paymentTarget",
      ];

      if (req.body.organizerData) {
         const Errordata = [];
         for (const field of requeredFields) {
            if (!req.body.organizerData[field]) {
               Errordata.push(field);
            }
         }
         if (Errordata.length > 0) {
            throw new ApiError(
               `Organizer data is required for ${Errordata.join(", ")}`,
               400
            );
         }
      }
      if (!err.isEmpty()) {
         throw new ApiError(err.array()[0].msg, 400);
      }

      next();
   },
];

export const validateLogin = [
   body("userData.email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
   body("userData.password")
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
