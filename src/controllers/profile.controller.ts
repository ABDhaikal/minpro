import { NextFunction, Request, Response } from "express";
import { updateOrganizerService } from "../services/profiles/update-organizer.service";
import { updateProfilePictService } from "../services/profiles/update-profile-Pic.service";
import { updateProfileService } from "../services/profiles/update-profile.service";
import { updateUsernameService } from "../services/profiles/update-username.service";
import { updateEmailService } from "../services/profiles/update-email.service";
import { validatingEmailService } from "../services/profiles/validating-email.service";

export const UpdateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const picture = files.profilePict?.[0];
    const user = await updateProfileService(authUserId, req.body, picture);
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const UpdateUsernameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const user = await updateUsernameService(authUserId, req.body);
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
    const picture = files.profilePict?.[0];
    const user = await updateProfilePictService(authUserId, picture);
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
    const picture = files.picture?.[0];
    const user = await updateOrganizerService(authUserId, req.body, picture);
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const user = await updateEmailService(authUserId, req.body);
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const validatingEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const user = await validatingEmailService(authUserId, req.body);
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}