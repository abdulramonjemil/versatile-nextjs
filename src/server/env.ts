import "server-only"
import { forceGetNonEmptyString } from "@/lib/value"

const SERVER_ENV_NEON_DB_CONNECTION_STRING = forceGetNonEmptyString(
  process.env.NEON_DB_CONNECTION_STRING,
  "NeonDB connection string environment variable"
)

export { SERVER_ENV_NEON_DB_CONNECTION_STRING }
