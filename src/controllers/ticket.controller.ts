import { NextFunction, Request, Response } from "express";
import { createTicketService } from "../services/ticket/create-tickets.service";
import { deleteTicketService } from "../services/ticket/delete-tickets.service";
import { Ticket } from "@prisma/client";
import { updateTicketService } from "../services/ticket/update-tickets.service";
import { getTicketsByEventIdService } from "../services/ticket/get-tickets.service";
import { getUserEventTicketsService } from "../services/ticket/get-user-event-tickets.service";

export const createTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authID = res.locals.user.id;
    const { eventId } = req.params;
    const body = req.body;
    const result = await createTicketService(authID, eventId, body);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ticketId } = req.params;
    const authID = res.locals.user.id;

    const result = await deleteTicketService(authID, ticketId);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const updateTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const authID = res.locals.user.id;
    const ticketID = req.params.ticketId;
    // Ensure the correct data format is passed to the service
    const result = await updateTicketService(ticketID, authID, body);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketsByEventIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.eventId;
    const result = await getTicketsByEventIdService(eventId);

    res
      .status(200)
      .send({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};

export const getUserEventTicketServiceController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authID = res.locals.user.id;
    const result = await getUserEventTicketsService(authID);

    res.status(200).send({ message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};
