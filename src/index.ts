import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";
import eventsRouter from "./routes/events.router";
import cartsRouter from "./routes/carts.router";

const app = express();
app.use(cors());

app.use(express.json());


app.use("/events", eventsRouter);
app.use("/carts", cartsRouter);

// your error middle ware
app.use(errorMiddleware);
// listening to the server
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});
