import { PUBLIC_ENV_APP_ORIGIN } from "./env"

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
    trpcProcedure: (procedurePath: string) => url(`/api/trpc/${procedurePath}`)
  }
} as const satisfies RouteGetterList
