import express from "express";
import cookieParser from "cookie-parser";
import genreRouter from "./routes/genreRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import movieRouter from "./routes/movieRoutes.js";
import rentalRouter from "./routes/rentalRoutes.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { httpLogger } from "./utils/logger.js";
import helmet from "helmet";
// compression does not ship TypeScript declarations.
const compression = require("compression") as () => express.RequestHandler;
import corsMiddleware from "./utils/cors.js";
const app = express();

app.use(httpLogger);

app.use(helmet());
app.use(compression());
app.use(corsMiddleware());

app.use(express.json());
app.use(cookieParser());

app.use("/api/genres", genreRouter);
app.use("/api/customer", customerRouter);
app.use("/api/movies", movieRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use(errorMiddleware);

export default app;
