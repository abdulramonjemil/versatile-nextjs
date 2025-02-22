import "server-only"

import { cache } from "react"
import { TRPCError } from "@trpc/server"
import { AppTRPCContext } from "@/trpc/context"
import { lucia } from "@/server/auth/lucia"
import { setCookieHeader } from "@/server/headers"
import { appTRPCMiddleware } from "./base"

/**
 * This basically ensures that the procedure on which it is used has HTTP
 * related context values including the `req` and `resHeaders` objects. These
 * two objects will not be available if the procedure is called via a server
 * side caller or generally, when the procedure is not called via http.
 */
export const requireHTTPContextMiddleware = appTRPCMiddleware.create((opts) => {
  if (!opts.ctx.req || !opts.ctx.resHeaders || !opts.ctx.reqCookies) {
    throw new Error(
      "`req` or `resHeaders` object is required. This call is probably not a HTTP call."
    )
  }

  // Overwrite the types of `req` and `resHeaders` to be non-nullable
  return opts.next({
    ctx: {
      req: opts.ctx.req,
      resHeaders: opts.ctx.resHeaders,
      reqCookies: opts.ctx.reqCookies
    }
  })
})

/**
 * Enforce that a procedure is invoked from a particular type of handler. The
 * confirmation is done with the handler value set on the context. This can be
 * used to prevent a procedure from being called via HTTP for example.
 */
export const requireHandlerTypeMiddleware = appTRPCMiddleware.create(
  <Handler extends AppTRPCContext["handler"]>(
    opts: appTRPCMiddleware.options<typeof appTRPCMiddleware>,
    handler: Handler
  ) => {
    if (opts.ctx.handler !== handler) {
      throw new Error(
        `Expected procedure to be called using a '${handler}' handler`
      )
    }

    return opts.next({
      ctx: {
        // eslint-disable-next-line -- Force TS to keep `handler` with type `Handler`
        handler: handler as Handler
      }
    })
  }
)

/**
 * By using `React.cache`, we avoid making multiple requests to validate the
 * auth session. This is particularly TRPC decides to batch multiple HTTP
 * requests in a single API call.
 */
export const authInfoMiddleware = cache(
  appTRPCMiddleware
    .requiredContextValue<"reqCookies" | "resHeaders">()
    .create(async (opts) => {
      const sessionId = opts.ctx.reqCookies.get("Cookie") ?? null
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
        }
      })
    })
)

const requireAuthStateMW = appTRPCMiddleware.requiredContextValue<"auth">()
export const requireAuthStateMiddleware = requireAuthStateMW.create(
  <AuthState extends "authenticated" | "unauthenticated">(
    opts: appTRPCMiddleware.options<typeof requireAuthStateMW>,
    authState: AuthState
  ) => {
    const { auth } = opts.ctx
    const state =
      authState === "authenticated"
        ? ({ valid: !!auth, errorCode: "UNAUTHORIZED" } as const)
        : ({ valid: !auth, errorCode: "BAD_REQUEST" } as const)

    if (!state.valid) {
      throw new TRPCError({
        code: state.errorCode,
        message: `Invalid auth state. Expected user to be '${authState}'`
      })
    }

    interface AuthInfoByState {
      authenticated: NonNullable<typeof auth>
      unauthenticated: null
    }

    return opts.next({
      ctx: { auth: auth as AuthInfoByState[AuthState] }
    })
  }
)
