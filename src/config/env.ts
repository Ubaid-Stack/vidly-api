import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  MONGO_URI: z.string(),

  JWT_SECRET: z.string(),

  REFRESH_TOKEN_SECRET: z.string(),

  CLIENT_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);