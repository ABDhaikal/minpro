import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEvenLocationsService = async () => {
  const locations = await prisma.event.findMany({
    select: {
      location: true,
    },

    distinct: ["location"], // Ensure that only distinct (unique) locations are returned
  });

  if (!locations) {
    throw new ApiError("Location is empty", 404);
  }

  const data = locations.map((item) => item.location);

  return data;
};
