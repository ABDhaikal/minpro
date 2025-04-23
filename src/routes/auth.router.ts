import { Router } from "express";
import {
    forgotPasswordController,
    loginController,
   registerController,
   updatePasswordController,
   validatingRefferalCodeController,
} from "../controllers/auth.controller";
import { validateLogin, validateRegister } from "../validators/auth.validator";
import { verifyToken, verifyTokenForgot } from "../lib/jwt";

const router = Router();

// Define the all routes for the user router
router.post("/register", validateRegister, registerController);
router.post("/login", validateLogin, loginController);
router.post("/valid-refferal", validatingRefferalCodeController);
router.post("/forgot-pass", forgotPasswordController);
router.patch("/update-pass",verifyToken,verifyTokenForgot, updatePasswordController);

export default router;
