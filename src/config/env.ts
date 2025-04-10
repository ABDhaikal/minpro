import dotenv from "dotenv";

dotenv.config();

// Environment variables configuration
export const PORT = process.env.PORT;

// Database connection string
export const JWT_SECRET = process.env.JWT_SECRET_KEY;
