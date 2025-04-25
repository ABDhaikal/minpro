import { Router } from "express";
import {
   forgotPasswordController,
   loginController,
   registerController,
   registerOrganizerController,
   updatePasswordController,
   validatingRefferalCodeController,
} from "../controllers/auth.controller";
import {
   validateLogin,
   validateRegister,
   validateRegisterOrganizer,
} from "../validators/auth.validator";
import { verifyToken, verifyTokenForgot } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";
import { verifyRole } from "../middlewares/role.middleware";

const router = Router();

// Define the all routes for the user router
router.post("/register", validateRegister, registerController);
router.post(
   "/register-organizer",
   verifyToken,
   verifyRole(["USER"]),
   uploader().fields([{ name: "organizerPict", maxCount: 1 }]),
   fileFilter(["image/png", "image/jpeg", "image/avif"]),
   validateRegisterOrganizer,
   registerOrganizerController
);
router.post("/login", validateLogin, loginController);
router.post("/valid-refferal", validatingRefferalCodeController);
router.post("/forgot-pass", forgotPasswordController);
router.patch(
   "/update-pass",
   verifyToken,
   verifyTokenForgot,
   updatePasswordController
);

export default router;
