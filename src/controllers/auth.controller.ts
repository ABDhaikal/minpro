import { NextFunction, Request, Response } from "express";
import { registerService } from "../services/auth/register.service";

export const registerController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const user = await registerService(req.body);
      res.status(200).json(user);
   } catch (error) {
      return next(error);
   }
};
