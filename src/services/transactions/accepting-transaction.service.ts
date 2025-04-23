import { APP_URL } from "../../config/env";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import fs from "fs/promises";
import { join } from "path";
import { transporter } from "../../lib/nodemailer";
import Handlebars from "handlebars";

export const acceptingTransactionService = async (
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
      if (validating_ticket.tickets.amount < validating_ticket.tickets.buyed) {
         throw new ApiError("Ticket stock not enough", 400);
      }
      if (validating_ticket.quantity <= 0) {
         throw new ApiError("Invalid ticket quantity", 400);
      }
      if (!validating_ticket.quantity || validating_ticket.quantity <= 0) {
         throw new ApiError(
            `Invalid ticket quantity for ticket : ${validating_ticket.tickets.name} event : ${validating_ticket.tickets.events.name}`,
            400
         );
      }
   });

   const filteredTicket = transaction_ticket.filter((obj, idx, self) => {
      idx ===self.findIndex((o) => o.tickets.id === obj.tickets.id);
   });


   if (filteredTicket.length > 0) {
      throw new ApiError("Duplicate ticket found", 400);
   }

   const result = await prisma.$transaction(async (tx) => {
      const event_to_buy = transaction_ticket.map((valid_ticket) => {
         return {
            eventId: valid_ticket.tickets.events.id,
         };
      });

      const event_to_buy_unique = event_to_buy.filter(
         (obj, idx, self) =>
            idx === self.findIndex((o) => o.eventId === obj.eventId)
      );


      await Promise.all(
         event_to_buy_unique.map(async (event_to_buy) => {
            let exist_user_event = await tx.usersEvents.findFirst({
               where: {
                  userId: transaction.users.id,
                  eventId: event_to_buy.eventId,
               },
            });
            if (!exist_user_event) {
               exist_user_event = await tx.usersEvents.create({
                  data: {
                     userId: transaction.users.id,
                     eventId: event_to_buy.eventId,
                  },
               });
            }
         })
      );

      await Promise.all(
         transaction_ticket.map(async (valid_ticket) => {
            let user_event = await tx.usersEvents.findFirst({
               where: {
                  userId: transaction.users.id,
                  eventId: valid_ticket.tickets.events.id,
               },
            });
            if (!user_event) {
               throw new ApiError("fail to create user event", 400);
            }
            let user_event_ticket = await tx.userEventTicket.findFirst({
               where: {
                  userEventId: user_event.id,
                  ticketId: valid_ticket.tickets.id,
               },
            });

            if (!user_event_ticket) {
               user_event_ticket = await tx.userEventTicket.create({
                  data: {
                     userEventId: user_event.id,
                     ticketId: valid_ticket.tickets.id,
                     quantity: valid_ticket.quantity,
                  },
               });
            } else {
               user_event_ticket = await tx.userEventTicket.update({
                  where: { id: user_event_ticket.id },
                  data: {
                     quantity:
                        Number(user_event_ticket.quantity) +
                        Number(valid_ticket.quantity),
                  },
               });
            }
         })
      );

      const transactionUpdate = await tx.transaction.update({
         where: { id: transaction.id },
         data: {
            status: "DONE",
            updatedAt: new Date(),
         },
      });

      const templatePath = join(
         __dirname,
         "../../templates/confirm-transaction.hbs"
      );
      const templateSource = (await fs.readFile(templatePath)).toString();
      const compiledTemplate = Handlebars.compile(templateSource);
      const link = `${APP_URL}`;
      const html = compiledTemplate({
         username: transaction.users.username,
         reciptNumber: transactionUpdate.reciptNumber,
         linkUrl: link,
      });

      transporter.sendMail({
         to: transaction.users.email,
         subject: "Transaction Confirmation",
         html: html,
      });

      return transactionUpdate;
   });

   return result;
};
