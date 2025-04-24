import { User } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { JWT_SECRET, LOGIN_EXPIRATION } from "../../config/env";
import prisma from "../../config/prisma";
import { verifyPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

export const LoginService = async (body: Pick<User, "email" | "password">) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
   });
   if (!existingUser || existingUser.deletedAt) {
      throw new ApiError("Email is not registered", 404);
   }

   const isPasswordValid = await verifyPassword(
      body.password as string,
      existingUser.password as string
   );
   if (!isPasswordValid) {
      throw new ApiError("Invalid password", 401);
   }

   const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email as string,
      role: existingUser.role,
   };
   const token = sign(tokenPayload, JWT_SECRET as string, {
      expiresIn: LOGIN_EXPIRATION,
   });

   const message = `Welcome back ${existingUser.username}`;
   const { password, ...user } = existingUser;
   return {
      message,
      user,
      token,
   };
};
