import { Router } from "express";
import {
    updateOrganizerController,
    UpdateProfileController,
    updateProfilePictController,
} from "../controllers/profile.controller";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import {
    validateUpdateOrganizerProfile,
    validateUpdateUserProfile,
} from "../validators/porfile.validators";

const router = Router();

// Define the all routes for the user router

router.patch(
   "/profile",
   verifyToken,
   validateUpdateUserProfile,
   UpdateProfileController
);
router.patch("/profile-pict", verifyToken, updateProfilePictController);
router.patch(
   "/organizer",
   verifyToken,
   verifyRole(["ADMIN"]),
   validateUpdateOrganizerProfile,
   updateOrganizerController
);

export default router;
