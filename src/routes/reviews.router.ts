import { Router } from "express";
import { createReviewController } from "../controllers/reviews.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.post("/:eventId", verifyToken, createReviewController);

export default router;
