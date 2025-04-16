import { Router } from "express";
import {
  createCartController,
  deleteCartController,
  getCartController,
  updateCartController,
} from "../controllers/carts.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.get("/tickets", getCartController);
router.patch("/:id", verifyToken, updateCartController);
router.post("/", verifyToken,createCartController)
router.delete("/ticketId",verifyToken, deleteCartController);

export default router;
