import { Category } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export const getEventCategoryService = () => {
  return Object.values(Category);
};


//perlu memasukkan lokasi dan tanggal