import { Router } from "express";
import {
  getOrganizerProfileController,
  updateEmailController,
  updateOrganizerController,
  UpdateProfileController,
  updateProfilePictController,
  UpdateUsernameController,
  validatingEmailController,
} from "../controllers/profile.controller";
import { fileFilter } from "../lib/fileFilter";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { verifyRole } from "../middlewares/role.middleware";
import {
  validateEditOrganizer,
  validateUpdateEmail,
  validateUpdateName,
  validateUpdateUserProfile,
} from "../validators/porfile.validators";

const router = Router();

// Define the all routes for the user router

router.get(
  "/organizer",
  verifyToken,
  verifyRole(["ADMIN"]),
  getOrganizerProfileController
);

router.patch(
  "/",
  verifyToken,
  uploader().fields([{ name: "profilePict", maxCount: 1 }]),
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  validateUpdateUserProfile,
  UpdateProfileController
);

router.patch(
  "/username",
  verifyToken,
  validateUpdateName,
  UpdateUsernameController
);
router.patch("/email", verifyToken, validateUpdateEmail, updateEmailController);

router.patch(
  "/profile-pict",
  verifyToken,
  uploader().fields([{ name: "profilePict", maxCount: 1 }]),
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  updateProfilePictController
);
router.patch(
  "/organizer",
  verifyToken,
  verifyRole(["ADMIN"]),
  uploader().fields([{ name: "organizerPict", maxCount: 1 }]),
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  validateEditOrganizer,
  updateOrganizerController
);
router.post(
  "/validate-email",
  verifyToken,
  validateUpdateEmail,
  validatingEmailController
);

export default router;
