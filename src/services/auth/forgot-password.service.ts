import { sign } from "jsonwebtoken";
import { FORGOT_PASSWORD_EXPIRATION, JWT_SECRET } from "../../config/env";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const ForgotPasswordService = async (email: string) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: email },
   });
   if (!existingUser || existingUser.deletedAt) {
      throw new ApiError("Email is not registered", 404);
   }

   const tokenPayload = {
      tokenForget: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
   };
   const token = sign(tokenPayload, JWT_SECRET as string, {
      expiresIn: FORGOT_PASSWORD_EXPIRATION,
   });

   console.log(token);

   return " Password reset link sent to your email";
};
