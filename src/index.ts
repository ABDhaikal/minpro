import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";
import eventsRouter from "./routes/events.router";
import cartsRouter from "./routes/carts.router";
import profileRouter from "./routes/profile.route";

// define your routes here
import authRouter from "./routes/auth.route";
import transactionsRouter from "./routes/transactions.router";

// define the express app
const app = express();
app.use(cors());

app.use(express.json());

// your routes should be here
app.use("/events", eventsRouter);
app.use("/carts", cartsRouter);
app.use("/auth", authRouter);
<<<<<<< HEAD
app.use("/transactions", transactionsRouter);
=======
app.use("/profile", profileRouter);
>>>>>>> b119255836ac875465d35c0558c75e4d69055a19

// app.use("/examples", exampleRouter);
app.use("/events", eventsRouter); // example route

// your error middle ware
app.use(errorMiddleware);
// listening to the server
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});
