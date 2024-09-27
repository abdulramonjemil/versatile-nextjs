import { cache } from "react"
import cookie from "cookie"
import { lucia } from "@/server/auth/lucia"
import { db } from "@/db"
import { TRPCError } from "@trpc/server"
import { baseProcedure } from "./base"
import { TRPCAppContext } from "./context"

type TRPCMiddlewareFnOptions = Parameters<
  Extract<Parameters<typeof baseProcedure.use>[0], (...args: any[]) => unknown>
>[0]

type TRPCMiddlewareFnOptionsWithContextOverride<
  Context extends TRPCAppContext
> = {
  [K in keyof TRPCMiddlewareFnOptions]: K extends "ctx"
    ? Omit<TRPCMiddlewareFnOptions["ctx"], keyof Context> & Context
    : TRPCMiddlewareFnOptions[K]
}

export const dbConnectionMiddleware = (opts: TRPCMiddlewareFnOptions) => {
  return opts.next({ ctx: { db } satisfies TRPCAppContext })
}

/**
 * This basically ensures that the procedure on which it is used has the req and
 * resHeaders objects which are supplied from the fetch adapter for Next.js.
 * These two objects will not be available if the procedure is called via a
 * server side caller or generally, when the procedure is not called via http.
 */
export const requireFetchHandlerContextMiddleware = (
  opts: TRPCMiddlewareFnOptions
) => {
  if (!opts.ctx.req || !opts.ctx.resHeaders) {
    throw new Error(
      "`req` or `resHeaders` object is required. This call is probably not a HTTP call."
    )
  }

  // Overwrite the types of `req` and `resHeaders` to be non-nullable
  return opts.next({
    ctx: {
      req: opts.ctx.req,
      resHeaders: opts.ctx.resHeaders
    } satisfies TRPCAppContext
  })
}

export const requestCookiesMiddleware = (
  opts: TRPCMiddlewareFnOptionsWithContextOverride<{
    req: NonNullable<TRPCAppContext["req"]>
  }>
) => {
  const reqCookies = cookie.parse(opts.ctx.req.headers.get("Cookie") ?? "")
  return opts.next({ ctx: { reqCookies } satisfies TRPCAppContext })
}

/**
 * By using `React.cache`, we avoid making multiple requests to validate the
 * auth session. This is particularly TRPC decides to batch multiple HTTP
 * requests in a single API call.
 */
export const authSessionInfoMiddleware = cache(
  async (
    opts: TRPCMiddlewareFnOptionsWithContextOverride<{
      reqCookies: NonNullable<TRPCAppContext["reqCookies"]>
    }>
  ) => {
    const sessionId = opts.ctx.reqCookies.Cookie ?? null
    const auth: NonNullable<TRPCAppContext["auth"]> = sessionId
      ? await lucia.validateSession(sessionId)
      : { user: null, session: null }
    return opts.next({ ctx: { auth } satisfies TRPCAppContext })
  }
)

export const requireValidAuthSessionMiddleware = (
  opts: TRPCMiddlewareFnOptionsWithContextOverride<{
    auth: NonNullable<TRPCAppContext["auth"]>
  }>
) => {
  const { auth } = opts.ctx
  if (!auth.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Expected a valid user authentication session"
    })
  }

  return opts.next({ ctx: { auth } satisfies TRPCAppContext })
}

export const requireMissingAuthSessionMiddleware = (
  opts: TRPCMiddlewareFnOptionsWithContextOverride<{
    auth: NonNullable<TRPCAppContext["auth"]>
  }>
) => {
  const { auth } = opts.ctx
  if (auth.session) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Unexpected authentication session. Request expected no valid auth session."
    })
  }

  return opts.next({ ctx: { auth } satisfies TRPCAppContext })
}
