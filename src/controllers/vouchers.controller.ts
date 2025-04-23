import { NextFunction, Request, Response } from "express";
import { createVoucherService } from "../services/vouchers/create-voucher.service";
import { deleteVoucherService } from "../services/vouchers/delete-voucher.service";
import { updateVoucherService } from "../services/vouchers/update-voucher.service";
import { getVouchersByEventIdService } from "../services/vouchers/get-vouchers.service";
import { EventVoucher } from "@prisma/client";

export const createVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authID = res.locals.user.id;
    const { eventId } = req.params;
    const body = req.body;
    const result = await createVoucherService(authID, eventId, body);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};
export const deleteVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { voucherId } = req.params;
    const authID = res.locals.user.id;

    const result = await deleteVoucherService(authID, voucherId);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const updateVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract data from request body
    const body = req.body;
    const authID = res.locals.user.id;
    const { voucherId } = req.params;

    // Ensure the correct data format is passed to the service
    const result = await updateVoucherService(authID, voucherId, body);

    // Send success response
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Delegate error handling to centralized middleware
    next(error);
  }
};

export const getVouchersByEventIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const result = await getVouchersByEventIdService(eventId);
    res
      .status(200)
      .send({ success: true, message: result.message, data: result.data });
  } catch (error) {
    next(error);
  }
};
