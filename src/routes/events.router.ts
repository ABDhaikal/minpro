import { Router } from "express";
import { createCartController } from "../controllers/carts.controller";
import { getCategoryController, getEventController, getEventsController } from "../controllers/events.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.get("/", getEventsController);
router.get("/categories", getCategoryController);
router.get("/:slug", getEventController);
router.get("/", verifyToken,createCartController)


export default router;
