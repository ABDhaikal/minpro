import { Router } from "express";
import {
    getCategoryController,
    getEventController,
    getEventsController,
} from "../controllers/events.controller";

const router = Router();

router.get("/", getEventsController);
router.get("/categories", getCategoryController);
router.get("/:slug", getEventController);

export default router;
