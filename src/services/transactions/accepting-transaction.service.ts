import { APP_URL } from "../../config/env";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import fs from "fs/promises";
import { join } from "path";
import { transporter } from "../../lib/nodemailer";
import Handlebars from "handlebars";

export const acceptingTransactionService = async (
   transactionId: string,
   authUserId: string
) => {
   const transaction = await prisma.transaction.findFirst({
      where: {
         id: transactionId,
         status: "WAITING_FOR_ADMIN_CONFIRMATION",
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
      },
   });

   if (!transaction) {
      throw new ApiError("Transaction not found", 400);
   }

   if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION") {
      throw new ApiError("Transaction already accepted", 400);
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
                           user: true,
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
      if (validating_ticket.tickets.events.organizers.user.id !== authUserId) {
         throw new ApiError("unauthorize", 400);
      }
   });

   const result = await prisma.$transaction(async (tx) => {
      await Promise.all(
         transaction_ticket.map(async (valid_ticket) => {
            const user_event = await tx.usersEvents.findFirst({
               where: {
                  eventId: valid_ticket.tickets.events.id,
                  userId: authUserId,
               },
            });

            if (!user_event) {
               const new_user_event = await tx.usersEvents.create({
                  data: {
                     eventId: valid_ticket.tickets.events.id,
                     userId: authUserId,
                  },
               });

               await tx.userEventTicket.create({
                  data: {
                     userEventId: new_user_event.id,
                     ticketId: valid_ticket.tickets.id,
                     quantitiy: valid_ticket.quantity,
                  },
               });
            } else {
               const user_event_ticket = await tx.userEventTicket.findFirst({
                  where: {
                     userEventId: user_event.id,
                     ticketId: valid_ticket.tickets.id,
                  },
               });

               if (!user_event_ticket) {
                  await tx.userEventTicket.create({
                     data: {
                        userEventId: user_event.id,
                        ticketId: valid_ticket.tickets.id,
                        quantitiy: valid_ticket.quantity,
                     },
                  });
               } else {
                  await tx.userEventTicket.update({
                     where: { id: user_event_ticket.id },
                     data: {
                        quantitiy:
                           Number(user_event_ticket.quantitiy) +
                           Number(valid_ticket.quantity),
                     },
                  });
               }
            }
         })
      );

      const transactionUpdate = await tx.transaction.update({
         where: { id: transactionId },
         data: {
            status: "DONE",
            updatedAt: new Date(),
         },
      });

      // send verification email
      const templatePath = join(
         __dirname,
         "../../templates/confirm-transaction.hbs"
      );
      const templateSource = (await fs.readFile(templatePath)).toString();
      const compiledTemplate = Handlebars.compile(templateSource);
      const link = `${APP_URL}`;
      const html = compiledTemplate({
         name: transaction.users.username,
         reciptNumber: transactionUpdate.reciptNumber,
         linkUrl: link,
      });

      transporter.sendMail({
         to: transaction.users.email,
         subject: "Welcome to Our Service",
         html: html,
      });
      return transactionUpdate;
   });

   return result;
};
