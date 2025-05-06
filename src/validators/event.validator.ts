import { Category, Location } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateCreateEvent = [
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(Object.values(Category))
    .withMessage(
      "Invalid category. Must be one of: Sports, Festivals, Concerts, Theater"
    ),
  body("name")
    .notEmpty()
    .withMessage("Event name is required and must be a string")
    .isString()
    .withMessage("Event name is required and must be a string")
    .trim()
    .isLength({
      min: 5,
      max: 50,
    })
    .withMessage("Event name must be between 3 and 50 characters long")
    .matches(/^[a-zA-Z0-9 ]*$/)
    .withMessage("Event name must not contain special characters"),
  body("description")
    .notEmpty()
    .withMessage("description is required and must be a string")
    .isString()
    .withMessage("description is required and must be a string")
    .isLength({
      min: 20,
    }),
  body("location")
    .isIn(Object.values(Location))
    .withMessage("Invalid location"),
  body("eventStart")
    .notEmpty()
    .withMessage("eventStart is required and must be a string")
    .isISO8601()
    .withMessage("Event start mus be a valid  date format")
    .toDate(),
  body("eventEnd")
    .notEmpty()
    .withMessage("eventEnd is required and must be a string")
    .isISO8601()
    .withMessage("Event start mus be a valid  date format")
    .toDate(),
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new ApiError(firstError.msg, 400);
    }

    next();
  },
];
