import dotenv from "dotenv";

// Environment variables configuration
dotenv.config();

export const PORT = process.env.PORT;

// Database connection string
export const JWT_SECRET = process.env.JWT_SECRET_KEY;
