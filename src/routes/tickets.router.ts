import { Router } from "express";
import { getTicketController } from "../controllers/ticket.controllers";

const router = Router();
router.get("/tickets/:ticketId", getTicketController);

export default router;
