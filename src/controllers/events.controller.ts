import { NextFunction, Request, Response } from "express";
import { getEventsService } from "../services/events/get-events.service";
import { getEventCategoryService } from "../services/events/get-event-category.service";
import { getEventService } from "../services/events/get-event.service";
import { Category } from "@prisma/client";
import { getEvenLocationsService } from "../services/events/get-event-location.service";
import { createEventService } from "../services/events/create-event.service";
// import { uploadEventImagesService } from "../services/events/upload-event-images-services";
import { publishEventService } from "../services/events/publish-event.service";

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
      expired: (req.query.expired as string) === "true",
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
    res
      .status(200)
      .send({ data: result, message: "Event retrieved successfully" });
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
export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const picture = files.eventPict?.[0];
    const result = await createEventService(authUserId, body, picture);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const publishEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const authUserId = res.locals.user.id;
    const result = await publishEventService(authUserId, eventId);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};
