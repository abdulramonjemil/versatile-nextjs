import { loadEnvConfig } from "@next/env"

const cwd = process.cwd()
loadEnvConfig(cwd)

export const NODE_ENV_NEON_DB_CONNECTION_STRING =
  process.env.NEON_DB_CONNECTION_STRING!
