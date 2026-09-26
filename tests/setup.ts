import mongoose from "mongoose";
import { beforeAll, afterAll } from "vitest";
import connectDB from "../src/config/db.js";
import { env } from "../src/config/env.js";

beforeAll(async () => {
  await connectDB(env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});
