import prisma from "../config/prisma";
import { ApiError } from "../utils/api-error";

export const getExamplesService = async () => {
   try {
      const users = await prisma.user.findMany();
      return users;
   } catch (error) {
      throw new ApiError("Error fetching examples", 500);
   }
};
