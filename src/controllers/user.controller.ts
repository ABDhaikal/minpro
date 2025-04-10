import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { getUsersService } from "../services/get-users.service";

export const getUsersController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const users = await getUsersService();
      res.status(200).json(users);
   } catch (error) {
      next(new ApiError("Error fetching users", 500));
   }
};
