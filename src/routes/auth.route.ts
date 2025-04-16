import { Router } from "express";
import {
    loginController,
   registerController,
   validatingRefferalCodeController,
} from "../controllers/auth.controller";
import { validateLogin, validateRegister } from "../validators/auth.validator";

const router = Router();

// Define the all routes for the user router
router.post("/register", validateRegister, registerController);
router.post("/login", validateLogin, loginController);
router.post("/valid-refferal", validatingRefferalCodeController);
export default router;
