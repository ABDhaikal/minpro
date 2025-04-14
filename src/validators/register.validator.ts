import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { User } from "@prisma/client";

export const registerValidator = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   if (!req.body || typeof req.body !== "object") {
      throw new ApiError("Invalid request body", 400);
   }

   const { email, password, username } = req.body.userData as Partial<User>;

   if (!email || !password || !username) {
      throw new ApiError("Missing required fields", 400);
   }

   next();
};
