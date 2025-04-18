import { Request, Response, NextFunction } from "express";
import { getTicketService } from "../services/ticket/get-ticket.service";

export const getTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ticketId } = req.params;
    const result = await getTicketService(ticketId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
