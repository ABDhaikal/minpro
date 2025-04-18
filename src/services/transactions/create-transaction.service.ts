// import { Ticket, Transaction, TransactionStatus } from "@prisma/client";
// import prisma from "../../config/prisma";
// import { ApiError } from "../../utils/api-error";
// import { Backoffs } from "bullmq";
// import { userTransactionQueue } from "../../jobs/queue/transaction.queue";

// interface Iticket {
//   ticketId: string;
//   amount: number;
// }

// interface ICreateTransactionService {
//   cuponID: string[];
//   tickets: Iticket[];
//   pointsUsed: number;
// }
// export const createTransactionService = async (
//   body: ICreateTransactionService,
//   authUserId: string
// ) => {
//   // ngecek user yang mau transaksi bener apa engga (ngecek auth)

//   // ngecek cuponya ada apa engga
//   // ngecek kuponya punya user yang login bukan
//   // ngecek pointused mencukupi apa engga

//   // ngecek tiketnya ada apa engga
//   // ngecek daftar tiketnya dari event yang sama engga
//   // ngecek daftar tiketnya tersedia apa engga
//   // jumlah semua harga dikali jumlah ticket yang mau dibeli

//   // njumlah diskon dari kupon
//   //bikin total harga yang sudah dikurangi diskon
//   // menentukan deadline payment proof
//   // nambah data buyed di semua tiket yang mau dibeli

//   // bikin table transaski
//   // bikin table transaction ticket dari tickets
//   // bikin table cupon transaction

//   // bikin antrian redis

//   const user = await prisma.user.findUnique({
//     where: { id: authUserId },
//   });

//   if (body.cuponID) {
//     const cupon = await prisma.cuponDiscount.findMany({
//       where: { id: authUserId },
//     });
//     if (!body.cuponID) {
//       throw new ApiError("Cupon not found", 404);
//     }
//   }

//   if (!user) {
//     throw new ApiError("User not found", 404);
//   }

//   const newTransaction = await prisma.$transaction(async (tx) => {
//     //kalo user mau pake point??
//     if (body.pointsUsed > 0) {
//       const updatedUser = await tx.user.update({
//         where: { id: authUserId },
//         data: { point: { decrement: body.pointsUsed } },
//       });

//       if (updatedUser.point < 0) {
//         throw new ApiError("Insufficient points", 400);
//       }
//     }

//     return await tx.transaction.create({
//       data: {
//         userId: authUserId,
//         status: TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION, //tidak ada PENDING??
//         pointsUsed: body.pointsUsed,
//         totalPrice: body.totalPrice,
//         paymentDeadline: body.paymentDeadline,
//       },
//     });
//   });

//   await userTransactionQueue.add(
//     "new-transaction",
//     {
//       uuid: newTransaction.id,
//     },
//     {
//       jobId: newTransaction.id,
//       delay: 2 * 60000,
//       removeOnComplete: true,
//       attempts: 5,
//       backoff: {
//         type: "exponential",
//         delay: 1000,
//       },
//     }
//   );

//   return { messaage: "Transaction created successfully", data: newTransaction };
// };
