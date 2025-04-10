import { Router } from "express";
import { getExamplesController } from "../controllers/example.controller";

const router = Router();

// Define the all routes for the example router
router.get("/", getExamplesController);
export default router;
