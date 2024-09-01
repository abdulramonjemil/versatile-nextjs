import { forceGetNonEmptyString } from "@/lib/value"

// APP URL CONFIGURATION
export const PUBLIC_ENV_APP_HOSTNAME = forceGetNonEmptyString(
  process.env.NEXT_PUBLIC_APP_HOSTNAME,
  "app hostname environment variable"
)

export const PUBLIC_ENV_APP_HOST = forceGetNonEmptyString(
  process.env.NEXT_PUBLIC_APP_HOST,
  "app host environment variable"
)

export const PUBLIC_ENV_APP_ORIGIN = forceGetNonEmptyString(
  process.env.NEXT_PUBLIC_APP_ORIGIN,
  "app origin environment variable"
)
