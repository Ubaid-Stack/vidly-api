import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
