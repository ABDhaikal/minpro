import { Router } from "express";
import {
  updateEmailController,
  updateOrganizerController,
  UpdateProfileController,
  updateProfilePictController,
  UpdateUsernameController,
  validatingEmailController,
} from "../controllers/profile.controller";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import {
  validateUpdateEmail,
  validateUpdateName,
  validateUpdateUserProfile,
} from "../validators/porfile.validators";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";

const router = Router();

// Define the all routes for the user router

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
  uploader().fields([{ name: "picture", maxCount: 1 }]),
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  updateOrganizerController
);
router.post(
  "/validate-email",
  verifyToken,
  validateUpdateEmail,
  validatingEmailController
);

export default router;
