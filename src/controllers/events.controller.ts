import { NextFunction, Request, Response } from "express";
import { getEventsService } from "../services/events/get-events.service";
import { getEventCategory } from "../services/events/get-category-events.service";

export const getEventController = async (
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
  try{
  const result = getEventCategory();
  res.status(200).send({ data: result });
  }
  catch(error){
  next(error);
  }
};

//   try {
//     const { id } = req.params as { id: string };

//     const events = await getThumbnailEventsService(id);
//     return res.status(200).send({ events
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getCategoryEventsController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const categories = await getCategoryEventsService();
//     console.log("Controller received:", categories); // Add this for debugging

//     res.status(200).send({ data: categories });
//   } catch (error) {
//     next(new ApiError("Error fetching category", 500));
//   }
// };

// export const getEventsByCategoryController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { category } = req.query;

//     if (!category) {
//       return next(new ApiError("Category is required", 400));
//     }

//     // Ambil acara berdasarkan kategori
//     const events = await getEventsByCategoryService(category as string);
//     res.status(200).send({ data: events });
//   } catch (error) {
//     next(error);
//   }
// };
