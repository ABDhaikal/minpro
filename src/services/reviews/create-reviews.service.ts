import { ApiError } from "../../utils/api-error";
import prisma from "../../config/prisma";
import { log } from "console";

interface ICreateReview {
  eventId: string;
  review?: string;
  rating: number;
}

export const createReviewService = async (
  authID: string,
  eventID: string,
  data: ICreateReview
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventID },
  });

  if (!event) {
    console.log("Event not found");
    
    throw new ApiError("Event not found", 404);
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new ApiError("Rating must be between 1 and 5", 400);
  }

  const userEvent = await prisma.usersEvents.findFirst({
    where: {
      id:eventID,
      userId: authID,
      deletedAt: null,
    },
  });

  if (!userEvent) {
    throw new ApiError("You are not registered for this event", 404);
  }

  const completedTransaction = await prisma.transaction.findFirst({
    where: {
      userId: authID,
      status: "DONE",
    },
  });

  if (!completedTransaction) {
    throw new ApiError(
      "You cannot create a review because no completed transaction was found",
      403
    );
  }

  const updatedUserEvent = await prisma.usersEvents.update({
    where: {
      id: userEvent.id,
    },
    data: {
      review: data.review,
      rating: data.rating,
    },
  });

  return {
    data: updatedUserEvent,
    message:
      userEvent.review !== null || userEvent.rating !== null
        ? "Review successfully updated"
        : "Review successfully created",
  };
};
