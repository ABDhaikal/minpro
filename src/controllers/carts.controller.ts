import { NextFunction, Request, Response } from "express";
import { getCartService } from "../services/carts/get-cart.service";
import { deleteCartService } from "../services/carts/delete-cart.service";
import { createCartService } from "../services/carts/create-cart.service";
import { updateCartService } from "../services/carts/update-cart.service";
import { ApiError } from "../utils/api-error";

export const getCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const userId = res.locals.user?.id;
    const result = await getCartService(userId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ticketId } = req.params;
    const userId = res.locals.user?.id;

    const result = await deleteCartService(ticketId, userId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const createCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;

    if (!res.locals.user || !res.locals.user.id) {
      throw new ApiError("need to login before add chart", 401);
    }

    const userId = res.locals.user.id;

    const cartItems = await createCartService(body, userId);

    res.status(201).send({
      message: "Cart updated successfully.",
      data: cartItems,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const userId = res.locals.user.id;
    const result = await updateCartService(body, userId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
