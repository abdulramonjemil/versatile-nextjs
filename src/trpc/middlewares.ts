import "server-only"

import { cache } from "react"
import cookie from "cookie"
import { setCookieHeader } from "@/server/headers"
import { lucia } from "@/server/auth/lucia"
import { TRPCError } from "@trpc/server"

import type { baseProcedure } from "@/trpc/base"
import { AppTRPCContext } from "@/trpc/context"

type AppTRPCMiddleware = Extract<
  Parameters<typeof baseProcedure.use>[0],
  (...args: any[]) => unknown
>

type AppTRPCMiddlewareOptions = Parameters<AppTRPCMiddleware>[0]
type AppTRPCMiddlewareReturn = ReturnType<AppTRPCMiddleware>
type AppTRPCMiddlewareContextOverride = Partial<AppTRPCContext>

type AppTRPCMiddlewareOptionsWithRequiredCtxValue<
  RequiredCtxValue extends keyof AppTRPCContext
> = {
  [K in keyof AppTRPCMiddlewareOptions]: K extends "ctx"
    ? Omit<AppTRPCMiddlewareOptions["ctx"], RequiredCtxValue> &
        Pick<Required<AppTRPCContext>, RequiredCtxValue>
    : AppTRPCMiddlewareOptions[K]
}

class AppTRPCMiddlewareBuilder<RequiredCtxValue extends keyof AppTRPCContext> {
  // eslint-disable-next-line class-methods-use-this
  create<TParams extends unknown[], TReturn extends AppTRPCMiddlewareReturn>(
    def: (
      opts: AppTRPCMiddlewareOptionsWithRequiredCtxValue<RequiredCtxValue>,
      ...params: TParams
    ) => TReturn
  ) {
    return (...params: TParams) => {
      return (
        opts: AppTRPCMiddlewareOptionsWithRequiredCtxValue<RequiredCtxValue>
      ) => def(opts, ...params)
    }
  }

  /**
   * This allows for specifying contexts which might be optional (on the context
   * interface) as required on the type of the generated middleware
   */
  // eslint-disable-next-line class-methods-use-this
  requiredContext<RequiredCtxVal extends keyof AppTRPCContext>() {
    return new AppTRPCMiddlewareBuilder<RequiredCtxVal>()
  }
}

// By default, no optional context should be required, so we use `never`
const appTRPCMiddleware = new AppTRPCMiddlewareBuilder<never>()

/**
 * This basically ensures that the procedure on which it is used has the req and
 * resHeaders objects which are supplied from the fetch adapter for Next.js.
 * These two objects will not be available if the procedure is called via a
 * server side caller or generally, when the procedure is not called via http.
 */
export const requireFetchHandlerContextMiddleware = appTRPCMiddleware.create(
  (opts: AppTRPCMiddlewareOptions) => {
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
      } satisfies AppTRPCMiddlewareContextOverride
    })
  }
)

export const requestCookiesMiddleware = appTRPCMiddleware
  .requiredContext<"req">()
  .create((opts) => {
    const reqCookies = cookie.parse(opts.ctx.req.headers.get("Cookie") ?? "")
    return opts.next({
      ctx: { reqCookies } satisfies AppTRPCMiddlewareContextOverride
    })
  })

/**
 * By using `React.cache`, we avoid making multiple requests to validate the
 * auth session. This is particularly TRPC decides to batch multiple HTTP
 * requests in a single API call.
 */
export const authSessionInfoMiddleware = cache(
  appTRPCMiddleware
    .requiredContext<"reqCookies" | "resHeaders">()
    .create(async (opts) => {
      const sessionId = opts.ctx.reqCookies.Cookie ?? null
      const auth = sessionId ? await lucia.validateSession(sessionId) : null

      const invalidSessionIdIsStored = sessionId && !auth?.session
      if (auth?.session?.fresh || invalidSessionIdIsStored) {
        const { name, value, attributes } = auth?.session?.fresh
          ? lucia.createSessionCookie(auth.session.id)
          : lucia.createBlankSessionCookie()

        const cookieHeader = setCookieHeader(name, value, attributes)
        opts.ctx.resHeaders.append(cookieHeader.name, cookieHeader.value)
      }

      return opts.next({
        ctx: {
          auth: auth?.session ? auth : null
        } satisfies AppTRPCMiddlewareContextOverride
      })
    })
)

export const requireValidAuthSessionMiddleware = appTRPCMiddleware
  .requiredContext<"auth">()
  .create((opts) => {
    const { auth } = opts.ctx
    if (!auth?.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Expected a valid user authentication session"
      })
    }

    return opts.next({
      ctx: { auth } satisfies AppTRPCMiddlewareContextOverride
    })
  })

/** Enforce that user is not logged in */
export const requireMissingAuthSessionMiddleware = appTRPCMiddleware
  .requiredContext<"auth">()
  .create((opts) => {
    const { auth } = opts.ctx
    if (auth !== null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Unexpected authentication session. Request expected no valid auth session."
      })
    }

    return opts.next({
      ctx: { auth } satisfies AppTRPCMiddlewareContextOverride
    })
  })
