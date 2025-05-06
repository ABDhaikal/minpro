import { NextFunction, Request, Response } from "express";
import { acceptingTransactionService } from "../services/transactions/accepting-transaction.service";
import { createTransactionService } from "../services/transactions/create-transaction.service";
import { getEventTransChartService } from "../services/transactions/get-event-trans-chart.service";
import { getEventTransactionService } from "../services/transactions/get-event-trasaction.service";
import { getIncomeService } from "../services/transactions/get-income.service";
import { getOrgTransDetailService } from "../services/transactions/get-org-trans-detail.service";
import { getTransactionsService } from "../services/transactions/get-transactions.service";
import { getUserPointService } from "../services/transactions/get-user-point.service";
import { rejectingTransactionService } from "../services/transactions/rejecting-transaction.service";
import { uploadPaymentProofService } from "../services/transactions/upload-proof-payment.service";
import { ApiError } from "../utils/api-error";

export const getTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getTransactionsService({
      userId,
      page: Number(page),
      limit: Number(limit),
    });
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createTransactionService(
      req.body,
      String(res.locals.user.id)
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const uploadPaymentProofController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const picture = files.proofImage?.[0];

    if (!picture) {
      throw new ApiError("No file uploaded", 400);
    }

    const { reciptNumber } = req.params;
    const authUserId = res.locals.user.id;

    const result = await uploadPaymentProofService(
      reciptNumber,
      authUserId,
      picture
    );

    res.status(201).send(result);
  } catch (error: any) {
    next(error);
  }
};

export const acceptingTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reciptNumber } = req.params;
    const authUserId = res.locals.user.id;

    const result = await acceptingTransactionService(reciptNumber, authUserId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const rejectingTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reciptNumber } = req.params;
    const authUserId = res.locals.user.id;

    const result = await rejectingTransactionService(reciptNumber, authUserId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getUserPointController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;

    const result = await getUserPointService(authUserId);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 10,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "updatedAt",
      search: (req.query.search as string) || "",
      date: (req.query.date as string) || null,
      ticket: (req.query.ticket as string) || "",
      eventid: (req.query.eventid as string) || null,
      status: (req.query.status as string) || null,
    };
    const result = await getEventTransactionService(authUserId, query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventTransChartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const query = {
      datefrom: (req.query.datefrom as string) || undefined,
      eventid: (req.query.eventid as string) || undefined,
    };
    const result = await getEventTransChartService(authUserId, query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getOrgTransDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reciptNumber } = req.params;
    const authUserId = res.locals.user.id;

    const result = await getOrgTransDetailService(authUserId, reciptNumber);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getIncomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const query = {
      eventid: (req.query.eventid as string) || undefined,
    };
    const result = await getIncomeService(authUserId, query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
