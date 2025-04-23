import { param, body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";
import { NextFunction, Request, Response } from "express";

export const validateUploadImages = [
  param("eventId").notEmpty().withMessage("Event ID is required"),

  body("thumbnailIndex")
    .notEmpty()
    .withMessage("Thumbnail index is required")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Thumbnail index must be a valid non-negative integer"),

  (req: Request, _res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      throw new ApiError(err.array()[0].msg, 400);
    }
    next();
  },
];
