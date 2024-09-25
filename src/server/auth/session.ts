import "server-only"

import {
  appCookieNames,
  CookieConfigGetterList,
  ExtraCookieConfig
} from "@/shared/cookies"
import { PUBLIC_ENV_APP_HOST } from "@/env/shared"
import { SERVER_ENV_NODE_ENV } from "@/env/server"

export const sessionCookieConfigs = {
  token: <Extra extends ExtraCookieConfig<"expires">>(extra: Extra) => ({
    name: appCookieNames.auth.sessionToken(),
    domain: PUBLIC_ENV_APP_HOST,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: SERVER_ENV_NODE_ENV === "production",
    ...extra
  })
} as const satisfies CookieConfigGetterList
