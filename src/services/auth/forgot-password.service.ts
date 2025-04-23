import fs from "fs/promises";
import Handlebars from "handlebars";
import { sign } from "jsonwebtoken";
import { join } from "path";
import {
   APP_URL,
   FORGOT_PASSWORD_EXPIRATION,
   JWT_SECRET_RESET_PASS_KEY
} from "../../config/env";
import prisma from "../../config/prisma";
import { transporter } from "../../lib/nodemailer";
import { ApiError } from "../../utils/api-error";

export const ForgotPasswordService = async (email: string) => {
   if (!email || !email.trim()) {
      throw new ApiError("Email is required", 400);
   }
   if (typeof email !== "string") {
      throw new ApiError("Email must be a string", 400);
   }

   const existingUser = await prisma.user.findUnique({
      where: { email: email },
   });
   if (!existingUser || existingUser.deletedAt) {
      throw new ApiError("Email is not registered", 404);
   }

   const tokenPayload = {
      tokenForget: existingUser.id,
   };
   const token = sign(tokenPayload, JWT_SECRET_RESET_PASS_KEY as string, {
      jwtid: existingUser.id,
      expiresIn: FORGOT_PASSWORD_EXPIRATION,
   });

   // send verification email
   const templatePath = join(__dirname, "../../templates/reset-pass.hbs");
   const templateSource = (await fs.readFile(templatePath)).toString();
   const compiledTemplate = Handlebars.compile(templateSource);
   const link = `${APP_URL}/auth/reset-password/${token}`;
   const html = compiledTemplate({
      userName: existingUser.username,
      resetLink: link,
   });

   transporter.sendMail({
      to: existingUser.email,
      subject: "reset password",
      html: html,
   });
   return " Password reset link sent to your email";
};
