import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const validatingNewOrganizerNameService = async (
  authID: string,
  name: string
) => {
  const existingName = await prisma.organizer.findFirst({
    where: { name: { contains: name, mode: "insensitive" } },
    select: {
      id: true,
      userId: true,
    },
  });
  if (!existingName || existingName.userId == authID) {
    return {
      data: true,
      message: "Organizer name is available",
    };
  }
  throw new ApiError("Organizer name is already taken", 400);
};
