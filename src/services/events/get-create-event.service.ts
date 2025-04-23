import { Category, Event, Location, StatusEvent } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import slugify from "slugify";
import { body } from "express-validator";

export const getCreateEventService = async (authID: string, id: string) => {
  if (!id) {
    throw new ApiError("Event ID is required");
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: authID },
  });

  if (!organizer) {
    throw new ApiError("Organizer not found");
  }

  const data = await prisma.event.findUnique({
    where: { id: id, organizerId: organizer.id },
  });
  if (!data) {
    throw new ApiError("Event not found");
  }

  return {
    data: data,
  };
};
