// import prisma from "../../config/prisma";
// import { ApiError } from "../../utils/api-error";



// export const getUserEventTicketsService = async (authUserId: string) => {
//   const data = await prisma.userEventTicket.findMany({
//     where: {
//       userId: authUserId,
//     },
//   });

//   if (!data) throw new ApiError("cant find user tickets");

//   return {
//     data: data,
//     message: "succes",
//   };
// }