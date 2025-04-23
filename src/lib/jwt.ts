import { NextFunction, Request, Response } from "express";
import { TokenExpiredError, verify } from "jsonwebtoken";
import { JWT_SECRET, JWT_SECRET_RESET_PASS_KEY } from "../config/env";
import { ApiError } from "../utils/api-error";
export const verifyToken = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const token = req.headers.authorization?.split(" ")[1];

   if (!token) {
      throw new ApiError("Token is missing", 401);
   }

   verify(token, JWT_SECRET as string, (err, payload) => {
      if (err) {
         if (err instanceof TokenExpiredError) {
            throw new ApiError("Token expired", 401);
         } else {
            throw new ApiError("Invalid token", 401);
         }
      }
      res.locals.user = payload;

      next();
   });
};


export const verifyTokenForgot = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const token = req.headers.authorization?.split(" ")[1];

   if (!token) {
      throw new ApiError("Token is missing", 401);
   }

   verify(token, JWT_SECRET_RESET_PASS_KEY as string, (err, payload) => {
      if (err) {
         if (err instanceof TokenExpiredError) {
            throw new ApiError("Token expired", 401);
         } else {
            throw new ApiError("Invalid token", 401);
         }
      }
      res.locals.user = payload;

      next();
   });
};