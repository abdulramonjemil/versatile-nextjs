// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "drizzle-kit"
import { SERVER_ENV_NEON_DB_CONNECTION_STRING } from "./src/env/server"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./.generated/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: SERVER_ENV_NEON_DB_CONNECTION_STRING
  }
})
