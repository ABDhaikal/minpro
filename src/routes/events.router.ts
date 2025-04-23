import { Router } from "express";
import {
  createEventController,
  getCategoryController,
  getEventController,
  getEventsController,
  getLocationsEventController,
  publishEventController,
} from "../controllers/events.controller";
import { verifyRole } from "../middlewares/role.middleware";
import { verifyToken } from "../lib/jwt";
import { validateCreateEvent } from "../validators/event.validator";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";

const router = Router();

router.get("/", getEventsController);
router.get("/categories", getCategoryController);
router.get("/locations", getLocationsEventController);
router.get("/:slug", getEventController);

router.post(
  "/",
  uploader().fields([{ name: "eventPict", maxCount: 1 }]),
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  validateCreateEvent,
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  createEventController
);

router.post(
  "/publish/:eventId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  publishEventController
);

export default router;
