import { Router } from "express";
import { getUsersController } from "../controllers/user.controller";

const router = Router();

// Define the all routes for the user router
router.get("/", getUsersController);
export default router;
