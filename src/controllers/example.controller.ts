import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { getExamplesService } from "../services/get-examples.service";

export const getExamplesController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const result = await getExamplesService();
      res.status(200).json(result);
   } catch (error) {
      next(new ApiError("Error fetching examples", 500));
   }
};
