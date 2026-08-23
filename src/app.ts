import express from "express";
import genreRouter from "./routes/genreRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import movieRouter from "./routes/movieRoutes.js";
import rentalRouter from "./routes/rentalRoutes.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(express.json());

app.use("/api/genres", genreRouter);
app.use("/api/customer", customerRouter);
app.use("/api/movies", movieRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// Error middleware MUST be last
app.use(errorMiddleware);

export default app;

