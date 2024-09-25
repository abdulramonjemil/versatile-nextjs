import "server-cli-only" // Can also be used outside Next.js

import { loadEnvConfig } from "@next/env"
import { forceGetNonEmptyString } from "@/lib/value"

/**
 * Load env like Next.js does if code isn't running in Next.js environment
 * `process.env.NEXT_RUNTIME` is mentioned in the Next.js docs here:
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
if (!(["nodejs", "edge"] as unknown[]).includes(process.env.NEXT_RUNTIME)) {
  loadEnvConfig(process.cwd())
}

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
