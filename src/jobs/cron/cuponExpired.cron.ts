import { scheduleJob } from "node-schedule";
import prisma from "../../config/prisma";

scheduleJob("cupon-expired-check", "0 0 * * *", () => {
   cuponExpiredService();
});

const cuponExpiredService = async () => {
   const data = await prisma.cuponDiscount.findMany({
      where: {
         expiredAt: {
            lte: new Date(),
         },
      },
   });
   if (data.length > 0) {
      await prisma.cuponDiscount.updateMany({
         where: {
            expiredAt: {
               lte: new Date(),
            },
            deletedAt: null,
         },
         data: {
            deletedAt: new Date(),
         },
      });
   }
};
