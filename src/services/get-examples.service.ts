import prisma from "../config/prisma";
import { ApiError } from "../utils/api-error";

export const getExamplesService = async () => {
   try {
      const examples = await prisma.example.findMany();
      return examples;
   } catch (error) {
      throw new ApiError("Error fetching examples", 500);
   }
};
