// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "drizzle-kit"
import { NODE_ENV_NEON_DB_CONNECTION_STRING } from "./external/env"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./.generated/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: NODE_ENV_NEON_DB_CONNECTION_STRING
  }
})
