import { config } from "dotenv";
import { z } from "zod";

// Carregar variáveis de ambiente do arquivo .env
config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  // Security
  BCRYPT_COST: z.coerce.number().min(10).max(15).default(11),
  ALLOWED_ORIGINS: z
    .string()
    .default("*")
    .transform((val) => val.split(",")),
  CORS_ORIGIN: z.string().default("*"),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // Rate Limiting
  RATE_LIMIT_AUTH: z.coerce.number().default(10),
  RATE_LIMIT_TASKS: z.coerce.number().default(120),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = loadEnv();
