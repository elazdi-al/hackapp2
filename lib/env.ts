import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("./sqlite.db"),
  BETTER_AUTH_SECRET: z.string().min(1).default("development-secret-change-me"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
});
