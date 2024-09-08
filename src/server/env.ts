import "server-only"
import { forceGetNonEmptyString } from "@/lib/value"

// Generic environment variables
export const SERVER_ENV_NODE_ENV = process.env.NODE_ENV

// Database connection
export const SERVER_ENV_NEON_DB_CONNECTION_STRING = forceGetNonEmptyString(
  process.env.NEON_DB_CONNECTION_STRING,
  "NeonDB connection string environment variable"
)

// Google OAuth
export const SERVER_ENV_GOOGLE_OAUTH_CLIENT_ID = forceGetNonEmptyString(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  "Google OAuth client ID"
)
export const SERVER_ENV_GOOGLE_OAUTH_CLIENT_SECRET = forceGetNonEmptyString(
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  "Google OAuth client secret"
)
