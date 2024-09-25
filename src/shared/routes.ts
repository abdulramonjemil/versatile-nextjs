import { PUBLIC_ENV_APP_ORIGIN } from "@/env/shared"

const APP_ORIGIN = PUBLIC_ENV_APP_ORIGIN

type RouteGetter = (...params: any[]) => string
interface RouteGetterList {
  [x: string]: RouteGetter | RouteGetterList
}

function url(base: string) {
  return new URL(base, APP_ORIGIN).href
}

export const appRouteUrls = {
  // Root routes
  home: () => url("/"),

  api: {
    // tRPC routes
    trpcBase: () => url("/api/trpc"),
    trpcProcedure: (procedurePath: string) => url(`/api/trpc/${procedurePath}`),

    // Google OAuth routes
    auth: {
      googleOAuthInit: () => url("/api/auth/google"),
      googleOAuthCallback: () => url("/api/auth/google/callback")
    }
  }
} as const satisfies RouteGetterList
