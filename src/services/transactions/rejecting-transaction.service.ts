import { APP_URL } from "../../config/env";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import fs from "fs/promises";
import { join } from "path";
import { transporter } from "../../lib/nodemailer";
import Handlebars from "handlebars";

export const rejectingTransactionService = async (
   reciptNumber: string,
   authUserId: string
) => {
   const transaction = await prisma.transaction.findFirst({
      where: {
         reciptNumber: reciptNumber,
         deletedAt: null,
      },
      include: {
         users: {
            select: {
               id: true,
               username: true,
               email: true,
            },
         },

         transactionTicket: true,
         cuponTransactions: true,
      },
   });

   if (!transaction) {
      throw new ApiError("Transaction not found", 400);
   }

   if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION") {
      throw new ApiError("Transaction not provide to confirm", 400);
   }

   const transaction_ticket = await prisma.transactionTicket.findMany({
      where: { transactionId: transaction.id },
      include: {
         tickets: {
            include: {
               events: {
                  select: {
                     id: true,
                     name: true,
                     organizers: {
                        select: {
                           users: true,
                        },
                     },
                  },
               },
            },
         },
      },
   });

   if (!transaction_ticket || transaction_ticket.length === 0) {
      throw new ApiError("Transaction Ticket not found", 400);
   }

   transaction_ticket.map((validating_ticket) => {
      if (validating_ticket.tickets.events.organizers.users.id !== authUserId) {
         throw new ApiError("unauthorize", 400);
      }
   });

   await prisma.$transaction(async (tx) => {
      // kalau tidak update ke expired
      await tx.transaction.update({
         where: { reciptNumber: reciptNumber },
         data: { status: "REJECTED" },
      });

      // mengembalikan jumlah stock
      if (
         transaction.transactionTicket &&
         transaction.transactionTicket.length > 0
      ) {
         await Promise.all(
            transaction.transactionTicket.map(async (ticket) => {
               if (!ticket.quantity || ticket.quantity <= 0) {
                  throw new ApiError(
                     `Invalid ticket quantity for ticket ID: ${ticket.ticketId}`,
                     400
                  );
               }
               await tx.ticket.update({
                  where: { id: ticket.ticketId },
                  data: { buyed: { decrement: ticket.quantity } },
               });
            })
         );
      } else {
         throw new ApiError(`bad transaction no ticket to buy`, 400);
      }

      // balikin buyed voucher
      const validatingVoucher = await tx.voucherTransaction.findFirst({
         where: {
            transactionId: transaction.id,
         },
      });

      if (validatingVoucher) {
         const updateVoucherData = await tx.eventVoucher.update({
            where: {
               id: validatingVoucher.eventVoucherId,
            },
            data: {
               used: {
                  decrement: 1,
               },
            },
         });
         if (!updateVoucherData) {
            throw new ApiError("faied to restore voucher");
         }
      }

      // undeleted cupon
      if (
         transaction.cuponTransactions &&
         transaction.cuponTransactions.length > 0
      ) {
         await Promise.all(
            transaction.cuponTransactions.map(async (cupon) => {
               await tx.cuponDiscount.update({
                  where: { id: cupon.cuponDiscountId },
                  data: { used: { decrement: 1 } },
               });
            })
         );
      }

      // balikin point
      if (transaction.pointsUsed && transaction.pointsUsed > 0) {
         await tx.userPoint.update({
            where: {
               userId: transaction.userId,
            },
            data: { amount: { increment: transaction.pointsUsed } },
         });
      }
   });

   // kirim email ke user

   const templatePath = join(
      __dirname,
      "../../templates/reject-transaction.hbs"
   );
   const templateSource = (await fs.readFile(templatePath)).toString();
   const compiledTemplate = Handlebars.compile(templateSource);
   const link = `${APP_URL}`;
   const html = compiledTemplate({
      username: transaction.users.username,
      reciptNumber: reciptNumber,
      linkUrl: link,
   });

   transporter.sendMail({
      to: transaction.users.email,
      subject: "Transaction Confirmation",
      html: html,
   });

   return "Transaction has been rejected";
};
