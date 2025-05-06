import { Router } from "express";
import { verifyToken } from "../lib/jwt";
import { verifyRole } from "../middlewares/role.middleware";
import {
  createTicketController,
  deleteTicketController,
  getTicketsByEventIdController,
  getUserEventTicketServiceController,
  updateTicketController,
} from "../controllers/ticket.controller";
import {
  validateCreateTicket,
  validateUpdateTicket,
} from "../validators/ticket.validator";

const router = Router();

router.get("/my-tickets", verifyToken, getUserEventTicketServiceController);
router.get("/:eventId", getTicketsByEventIdController);

router.post(
  "/:eventId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  validateCreateTicket,
  createTicketController
);

router.put(
  "/:ticketId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  validateUpdateTicket,
  updateTicketController
);

router.delete(
  "/:ticketId",
  verifyToken,
  verifyRole(["ADMIN", "SUPERADMIN"]),
  deleteTicketController
);

export default router;
