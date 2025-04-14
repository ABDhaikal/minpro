import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";

// define your routes here
import authRouter from "./routes/auth.route";

// define the express app
const app = express();
// app cors
app.use(cors());

// define express json for parsing json data
app.use(express.json());

// your routes should be here
app.use("/auth", authRouter);

// app.use("/examples", exampleRouter);

// your error middle ware
app.use(errorMiddleware);
// listening to the server
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});
