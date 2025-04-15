import { Router } from "express";
import { registerController, validatingRefferalCodeController } from "../controllers/auth.controller";
import { validateRegister } from "../validators/auth.validator";

const router = Router();

// Define the all routes for the user router
router.post("/register", validateRegister, registerController);
router.post("/valid-refferal", validatingRefferalCodeController);
export default router;
