import { Router } from "express";
import { registerController } from "../controllers/auth.controller";
import { registerValidator } from "../validators/register.validator";

const router = Router();

// Define the all routes for the user router
router.post("/register", registerValidator, registerController);
export default router;
