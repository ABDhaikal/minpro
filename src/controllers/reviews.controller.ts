import { NextFunction, Request, Response } from "express";
import { createReviewService } from "../services/reviews/create-reviews.service";

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const { eventId } = req.params;
    const { review, rating } = req.body;

    const result = await createReviewService(userId, eventId, {
      eventId,
      review,
      rating,
    });
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};
