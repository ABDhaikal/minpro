import { NextFunction, Request, Response } from "express";
import { LoginService } from "../services/auth/login.service";
import { registerService } from "../services/auth/register.service";
import { validatingRefferalCodeService } from "../services/auth/validating-refferal-code.service";
import { ApiError } from "../utils/api-error";
import { updatePasswordService } from "../services/auth/update-password.service";
import { resetPasswordService } from "../services/auth/reset-password.service";
import { ForgotPasswordService } from "../services/auth/forgot-password.service";

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

export const updatePasswordController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const authUserId = res.locals.user.id;
      const tokenForget = res.locals.user.tokenForget;
      if (!authUserId && !tokenForget) {
         throw new ApiError(
            "You are not allowed to update password with token forget",
            401
         );
      }
      if (authUserId) {
         const result = await updatePasswordService(
            authUserId,
            req.body.oldPassword,
            req.body.newPassword
         );
         res.status(200).json(result);
      } else {
         const result = await resetPasswordService(
            tokenForget,
            req.body.newPassword
         );
      }
   } catch (error) {
      return next(error);
   }
};

export const forgotPasswordController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const email = req.body.email;
      const result = await ForgotPasswordService(email);
      res.status(200).json(result);
   } catch (error) {
      return next(error);
   }
};
