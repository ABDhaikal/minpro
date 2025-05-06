import { NextFunction, Request, Response } from "express";
import { getEventsService } from "../services/events/get-events.service";
import { getEventCategoryService } from "../services/events/get-event-category.service";
import { getEventService } from "../services/events/get-event.service";
import { Category } from "@prisma/client";
import { getEvenLocationsService } from "../services/events/get-event-location.service";
import { createEventService } from "../services/events/create-event.service";
// import { uploadEventImagesService } from "../services/events/upload-event-images-services";
import { publishEventService } from "../services/events/publish-event.service";
import { getOrganizerEventsService } from "../services/events/get-organizer-event.service";
import { getOrgDetailEventService } from "../services/events/get-org-detail-event.service";
import { getEventOrgLocService } from "../services/events/get-org-event-location.service";
import { getEventAtendeeService } from "../services/events/get-event-atandee.service";
import { getOrgAllEventNameService } from "../services/events/get-org-all-event-name.service";

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

export const getOrganizerEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 4,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "createdAt",
      search: (req.query.search as string) || "",
      category: (req.query.category as string) || null,
      location: (req.query.location as string) || "",
      date: (req.query.date as string) || null,
    };
    const result = await getOrganizerEventsService(authUserId, query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getOrgDetailEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const { id } = req.params;
    const result = await getOrgDetailEventService(authUserId, id);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventOrgLocController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const result = await getEventOrgLocService(authUserId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventAtendeeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const { eventId } = req.params;
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 4,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "updatedAt",
      search: (req.query.search as string) || "",
      ticket: (req.query.ticket as string) || "",
    };
    const result = await getEventAtendeeService(authUserId, eventId, query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getOrgAllEventNameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const result = await getOrgAllEventNameService(authUserId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
