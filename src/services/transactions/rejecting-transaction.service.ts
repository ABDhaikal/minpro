import { APP_URL } from "../../config/env";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import fs from "fs/promises";
import { join } from "path";
import { transporter } from "../../lib/nodemailer";
import Handlebars from "handlebars";

export const rejectingTransactionService = async (
   reciptNumber: string,
   authUserId: string
) => {
};
