import { Router } from "express";
import {
  createEventController,
  getCategoryController,
  getEventAtendeeController,
  getEventController,
  getEventOrgLocController,
  getEventsController,
  getLocationsEventController,
  getOrgAllEventNameController,
  getOrganizerEventsController,
  getOrgDetailEventController,
  publishEventController,
} from "../controllers/events.controller";
import { verifyRole } from "../middlewares/role.middleware";
import { verifyToken } from "../lib/jwt";
import { validateCreateEvent } from "../validators/event.validator";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";

const router = Router();

router.get("/", getEventsController);
router.get(
  "/dropdown-event",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getOrgAllEventNameController
);
router.get(
  "/organizer",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getOrganizerEventsController
);
router.get(
  "/organizer/:id",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getOrgDetailEventController
);
router.get(
  "/attendees/:eventId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  getEventAtendeeController
);
router.get("/categories", getCategoryController);
router.get("/locations", getLocationsEventController);
router.get(
  "/locations/organizer",
  verifyToken,
  verifyRole(["ADMIN"]),
  getEventOrgLocController
);
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
