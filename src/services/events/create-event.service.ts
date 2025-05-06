import { Event } from "@prisma/client";
import slugify from "slugify";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const createEventService = async (
  authID: string,
  data: Omit<Event, "slug" | "createdAt" | "deletedAt" | "updatedAt">,
  eventPict: Express.Multer.File | undefined
) => {
  const organizer = await prisma.organizer.findUnique({
    where: { userId: authID },
  });

  if (!organizer) {
    throw new ApiError("Organizer not found");
  }

  if (data.eventStart >= data.eventEnd) {
    throw new ApiError("Event start date must be before event end date");
  }

  const validateNameEvent = await prisma.event.findUnique({
    where: { name: data.name },
  });

  if (validateNameEvent && validateNameEvent.id !== data.id) {
    throw new ApiError("Event name already exists");
  }

  const slug = slugify(data.name, {
    replacement: "_",
    lower: true,
  });

  const isUpdate = data.id ? true : false;

  const isUpdateImage = isUpdate && eventPict ? true : false;

  if (!isUpdate && !eventPict) {
    throw new ApiError("Event picture is required", 400);
  }

  let eventPictUrl = "";

  let eventLama;

  if (isUpdate) {
    eventLama = await prisma.event.findUnique({
      where: { id: data.id },
    });
  }

  if (!isUpdate) {
    const { secure_url } = await cloudinaryUpload(
      eventPict!,
      `eventPict/${data.name}`
    );
    eventPictUrl = secure_url;
  } else if (isUpdateImage) {
    await cloudinaryRemove(eventLama!.image);
    const { secure_url } = await cloudinaryUpload(
      eventPict!,
      `eventPict/${data.name}`
    );
    eventPictUrl = secure_url;
  } else {
    eventPictUrl = eventLama!.image;
  }

  if (isUpdate) {
    const event = await prisma.event.findUnique({
      where: { id: data.id },
    });

    if (!event) {
      throw new ApiError("Event not found", 404);
    }

    if (event.organizerId !== organizer.id) {
      throw new ApiError("You are not authorized to update this event", 403);
    }

    const updateEvent = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        organizerId: organizer.id,
        category: data.category,
        name: data.name,
        slug: slug,
        description: data.description,
        location: data.location,
        eventStart: data.eventStart,
        image: eventPictUrl,
        eventEnd: data.eventEnd,
      },
    });
    if (!updateEvent) {
      throw new ApiError("Failed to update event", 500);
    }
  } else {
    if (!eventPict) {
      throw new ApiError("Event picture is required", 400);
    }
    const createdEvent = await prisma.event.create({
      data: {
        image: eventPictUrl,
        organizerId: organizer.id,
        category: data.category,
        name: data.name,
        slug: slug,
        description: data.description,
        status: "DRAFT",
        location: data.location,
        eventStart: data.eventStart,
        eventEnd: data.eventEnd,
      },
    });
    if (!createdEvent) {
      throw new ApiError("Failed to create event", 500);
    }
  }

  return {
    message: "Event created successfully",
    data: data,
  };
};
