import { NextFunction, Request, Response } from "express";
import { registerService } from "../services/auth/register.service";
import { validatingRefferalCodeService } from "../services/auth/validating-refferal-code.service";
import { LoginService } from "../services/auth/login.service";

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

export const validatingRefferalCodeController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const referralCode = req.body.referralCode;
      const existingReferral = await validatingRefferalCodeService(
         referralCode
      );
      res.status(200).json(existingReferral);
   } catch (error) {
      return next(error);
   }
};



export const loginController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const user = await LoginService(req.body);
      res.status(200).json(user);
   } catch (error) {
      next(error);
   }
};
