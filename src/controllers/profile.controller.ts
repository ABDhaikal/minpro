import { NextFunction, Request, Response } from "express";
import { updateOrganizerService } from "../services/profiles/update-organizer.service";
import { updateProfilePictService } from "../services/profiles/update-profile-Pic.service";
import { updateProfileService } from "../services/profiles/update-profile.service";

export const UpdateProfileController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const authUserId = res.locals.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const user = await updateProfileService(
         authUserId,
         req.body,
         files.profilePict?.[0]
      );
      res.status(200).json(user);
   } catch (error) {
      return next(error);
   }
};

export const updateProfilePictController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const authUserId = res.locals.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const user = await updateProfilePictService(
         authUserId,
         files.profilePict?.[0]
      );
      res.status(200).json(user);
   } catch (error) {
      return next(error);
   }
};

export const updateOrganizerController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const authUserId = res.locals.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const user = await updateOrganizerService(
         authUserId,
         req.body,
         files.profilePict?.[0]
      );
      res.status(200).json(user);
   } catch (error) {
      return next(error);
   }
};


