import { Router } from "express";
import { getCategoryController, getEventController } from "../controllers/events.controller";

const router = Router();

router.get("/", getEventController);
router.get("/categories", getCategoryController);

export default router;
