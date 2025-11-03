import { defineConfig } from "drizzle-kit";
import { env } from "./src/infra/config/env";

export default defineConfig({
  schema: "./src/infra/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
