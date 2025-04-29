import { Router } from "express";
import {
  updateOrganizerController,
  UpdateProfileController,
  updateProfilePictController,
  updateUsernameController,
} from "../controllers/profile.controller";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import { validateUpdateUserProfile } from "../validators/porfile.validators";
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

router.patch("/username", verifyToken, updateUsernameController);

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

export default router;
