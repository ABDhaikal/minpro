import { Router } from "express";
import multer from "multer";
import {
  createEventController,
  getCategoryController,
  getEventController,
  getEventsController,
  getLocationsEventController,
  publishEventController
} from "../controllers/events.controller";
import { fileFilter } from "../lib/fileFilter";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { verifyRole } from "../middlewares/role.middleware";
import { validateCreateEvent } from "../validators/event.validator";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getEventsController);
router.get("/categories", getCategoryController);
router.get("/locations", getLocationsEventController);
router.get("/:slug", getEventController);

router.post(
  "/",
  fileFilter(["image/png", "image/jpeg", "image/avif"]),
  uploader().fields([{ name: "eventPict", maxCount: 1 }]),
  validateCreateEvent,
  verifyToken,
  verifyRole(["ADMIN","SUPERADMIN"]),
  createEventController
);

// router.post(
//   "/upload-event-images/:eventId",
//   uploader().fields([{ name: "eventImages", maxCount: 5 }]),
//   fileFilter(["image/png", "image/jpeg", "image/avif"]),
//   validateUploadImages,
//   uploadEventImagesController
// );
router.post("/publish/:eventId",
  verifyToken,
  verifyRole(["ADMIN","SUPERADMIN"]),
  publishEventController);

export default router;
