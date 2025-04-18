import { NextFunction, Request, Response } from "express";
import { getEventsService } from "../services/events/get-events.service";
import { getEventCategoryService } from "../services/events/get-event-category.service";
import { getEventService } from "../services/events/get-event.service";
import { Category } from "@prisma/client";
import { getEvenLocationsService } from "../services/events/get-event-location.service";

export const getEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 3,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "createdAt",
      search: (req.query.search as string) || "",
      category: (req.query.category as string) || "",
      location: (req.query.location as string) || "",
    };

    const result = await getEventsService(query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryController = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = getEventCategoryService();
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const getEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getEventService(req.params.slug as string);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};
export const getLocationsEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getEvenLocationsService();
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};
