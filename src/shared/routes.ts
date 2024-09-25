import { PUBLIC_ENV_APP_ORIGIN } from "@/env/shared"

type RouteGetter = (...params: any[]) => { url: URL }
const APP_ORIGIN = PUBLIC_ENV_APP_ORIGIN
const url = (path: string) => new URL(path, APP_ORIGIN)

export const homeRoute = (() => {
  return { url: url("/") }
}) satisfies RouteGetter

/** Passing `null` as `procedurePath` gives the trpc base url */
export const trpcProcedureRoute = ((procedurePath: string | null) => {
  return {
    url: url(procedurePath ? `/api/trpc/${procedurePath}` : `/api/trpc`)
  }
}) satisfies RouteGetter

export const googleOAuthInitRoute = (() => {
  return { url: url("/api/auth/google") }
}) satisfies RouteGetter

export const googleOAuthCallbackRoute = (() => {
  return { url: url("/api/auth/google/callback") }
}) satisfies RouteGetter
