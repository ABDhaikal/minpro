import { User } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { JWT_SECRET, LOGIN_EXPIRATION } from "../../config/env";
import prisma from "../../config/prisma";
import { verifyPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

interface ILoginService {
   userData: Pick<User, "email" | "password">;
}

export const LoginService = async (body: ILoginService) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: body.userData.email },
   });
   if (!existingUser || existingUser.deletedAt) {
      throw new ApiError("Email is not registered", 404);
   }

   if (existingUser.deletedAt) {
      throw new ApiError("User is not registered", 404);
   }

   // Check if the password is correct
   const isPasswordValid = await verifyPassword(
      body.userData.password,
      existingUser.password
   );
   if (!isPasswordValid) {
      throw new ApiError("Invalid password", 401);
   }

   //    generate token

   const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
   };
   const token = sign(tokenPayload, JWT_SECRET as string, {
      expiresIn: LOGIN_EXPIRATION,
   });

   const { password, ...userWithoutPassword } = existingUser;
   return {
      userWithoutPassword,
      token,
   };
};
