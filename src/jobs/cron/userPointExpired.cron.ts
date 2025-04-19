import { scheduleJob } from "node-schedule";
import prisma from "../../config/prisma";

scheduleJob("schedule-point-expired", "0 0 * * *", () => {
   userpointExpired();
});

const userpointExpired = async () => {
   const data = await prisma.userPoint.findMany({
      where: {
         expiredAt: {
            lte: new Date(),
         },
      },
   });
   if (data.length > 0) {
      await prisma.userPoint.updateMany({
         where: {
            expiredAt: {
               lte: new Date(),
            },
         },
         data: {
            expiredAt: null,
            amount: 0,
         },
      });

   }
};
