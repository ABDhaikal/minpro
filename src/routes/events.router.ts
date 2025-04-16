import { Router } from "express";
import {
    getCategoryController,
    getEventController,
    getEventsController,
    getLocationsEventController,
} from "../controllers/events.controller";

const router = Router();

router.get("/", getEventsController);
router.get("/categories", getCategoryController);
router.get("/locations", getLocationsEventController);
router.get("/:slug", getEventController);

export default router;
