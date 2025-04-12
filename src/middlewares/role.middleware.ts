import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const verifyRole = (roles: string[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
      const user = res.locals.user; // Assuming user information is stored in res.locals after token verification
      if (!user || !roles.includes(user.role)) {
         throw new ApiError("Forbidden", 403);
      }

      next();
   };
};
