import { EXPIRED_PAYMENT_DEADLINE_HOUR } from "../../config/env";
import prisma from "../../config/prisma";
import { userTransactionQueue } from "../../jobs/queue/transaction.queue";
import { ApiError } from "../../utils/api-error";

interface Iticket {
  ticketId: string;
  amount: number;
}

interface ICreateTransactionService {
  cuponID: string[] | undefined;
  voucherID: string | undefined;
  tickets: Iticket[];

  pointsUsed: number;
}

// kalau mau hit

/*
post 

{
  "cuponID" : ["A12131","B123123","C123123"] 
  "voucherID" : "asd12w"
  "tickets" : 
            [
            {
            "ticketId" : "VIP123123"
            "amount" : 10
            },
            {
            "ticketId" : "Regular123123"
            "amount" : 5
            }
            ]
}



*/


export const createTransactionService = async (
  body: ICreateTransactionService,
  authUserId: string
) => {
  const resut = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    let discountPercent = 1;
    let discountdecrease = 0;
    if (body.cuponID && body.cuponID.length > 0) {
      body.cuponID.map(async (cuponWant2use) => {
        const data = await tx.cuponDiscount.findFirst({
          where: { userId: authUserId, id: cuponWant2use, deletedAt: null },
        });
        if (!data) {
          throw new ApiError("Cupon not found", 404);
        }
        if (data.type === "FIXED_AMOUNT") {
          discountdecrease += data.amount;
        }
        if (data.type === "PERCENTAGE") {
          const pengkalinya = 1 - data.amount / 100;
          const yangharusdibayar = discountPercent * pengkalinya;
          discountPercent = yangharusdibayar;
        }
        await tx.cuponDiscount.update({
          where: {
            id: data.id,
          },
          data: { deletedAt: new Date() },
        });
      });
    }

    let totalPrice = 0;
    let eventid = "";

    body.tickets.map(async (ticketsFinding) => {
      const data = await tx.ticket.findFirst({
        where: { id: ticketsFinding.ticketId, deletedAt: null },
        include: {
          events: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!data) {
        throw new ApiError("Ticket not found", 404);
      }
      const available = data.amount - data.buyed;
      if (available < ticketsFinding.amount) {
        throw new ApiError("Ticket not available", 403);
      }
      if (eventid === "") {
        eventid = data.events.id as string;
      } else if (data.events.id !== eventid) {
        throw new ApiError(
          "system not provide buying ticket with different event"
        );
      }

      await tx.ticket.update({
        where: {
          id: data.id,
        },
        data: {
          buyed: {
            increment: ticketsFinding.amount,
          },
        },
      });
      totalPrice += ticketsFinding.amount * data.price;
    });

    if (body.voucherID && body.voucherID !== "") {
      if (typeof body.voucherID !== "string") {
        throw new ApiError("voucher id must be string");
      }

      const validatingVoucher = await tx.eventVoucher.findFirst({
        where: {
          id: body.voucherID,
          deletedAt: null,
        },
      });

      if (!validatingVoucher) {
        throw new ApiError("voucher not found", 404);
      }

      if (validatingVoucher.quota === validatingVoucher.used) {
        throw new ApiError("voucher is sold", 404);
      }

      if (validatingVoucher.eventId !== eventid) {
        throw new ApiError("voucher not provide for this transaction", 401);
      }

      await tx.eventVoucher.update({
        where: {
          id: body.voucherID,
        },
        data: {
          used: {
            increment: 1,
          },
        },
      });

      discountdecrease += validatingVoucher.amountDiscount;
    }

    totalPrice = (totalPrice - discountdecrease) * discountPercent;

    const newTransaction = await tx.transaction.create({
      data: {
        userId: authUserId,
        pointsUsed: body.pointsUsed,
        totalPrice: totalPrice,
        totalDecreaseDiscount: discountdecrease,
        totalPercentDiscount: discountPercent,
        paymentDeadline: new Date(
          Date.now() + EXPIRED_PAYMENT_DEADLINE_HOUR * 60 * 60 * 1000
        ),
      },
    });

    // bikin tabel voucher_transaction id transactionnya dari newTransaction

    if (body.voucherID) {
      const createTransaction = await tx.voucherTransaction.create({
        data: {
          transactionId: newTransaction.id,
          eventVoucherId: body.voucherID,
        },
      });
      if (!createTransaction) {
        throw new ApiError("Failed to create voucher transaction", 501);
      }
    }
    // bikin tabel ticket_transaction id transactionnya dari newTransaction

    if (body.tickets) {
      body.tickets.map(async (ticket) => {
        const createTicket = await tx.transactionTicket.create({
          data: {
            transactionId: newTransaction.id,
            ticketId: ticket.ticketId,
            amount: ticket.amount,
          },
        });
        if (!createTicket) {
          throw new ApiError("Failed to create voucher transaction", 501);
        }
      });
    }
    if (body.cuponID) {
      body.cuponID.map(async (cupon) => {
        const createCupon= await tx.cuponTransaction.create({
          data: {
            cuponId: cupon,
            transactionId: newTransaction.id
          },
        });
        if (!createCupon) {
          throw new ApiError("Failed to create voucher transaction", 501);
        }
      });
    }

    await userTransactionQueue.add(
      "new-transaction",
      {
        uuid: newTransaction.id,
      },
      {
        jobId: newTransaction.id,
        delay: 2 * 60000,
        removeOnComplete: true,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    return {
      messaage: "Transaction created successfully wait payment proof in 2 hour",
    };
  });
  return resut;
};
