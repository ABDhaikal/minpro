import { Category } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export const getEventCategory = () => {
  return Object.values(Category);
};
