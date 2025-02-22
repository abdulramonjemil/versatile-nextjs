import "server-only"

import cookie from "cookie"
import { db } from "@/db"
import { Session, User } from "@/server/auth/base"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

/**
 * We specify `req` and `resHeaders` instead of `res` because we are using
 * Next.js app router, and will be using the fetch adapter to use the router via
 * a route handler, and `FetchCreateContextFnOptions` passed to `createContext`
 * specifies those two. `reqCookies` can easily be parsed from `Cookie` header
 * on the request. It is included here for convenience.
 */
interface AppTRPCHTTPContext {
  req: Request
  resHeaders: Headers
  reqCookies: ReadonlyMap<string, string>
}

/**
 * This interface represents contexts supplied via the handler for the trpc
 * router. A handler is any means for instantiating access to the procedures
 * defined on the trpc router, and can be one of the following:
 * - http handler e.g. fetchRequestHandler
 * - createCaller()
 * - createServerSideHelpers() ... and so on
 *
 * Based on this, We make sure to specify context values that won't always be
 * available as optional. For example, http based context values e.g. `req` and
 * `resHeaders` may not necessarily be available when accessing the procedure
 * via `createCaller()` or helpers from `createServerSideHelpers()`.
 */
export interface AppTRPCHandlerSuppliedContext
  extends Partial<AppTRPCHTTPContext> {
  db: typeof db
  handler: "http" | "server" // Whether the proc is from http source or direct call from server
}

/**
 * This is used as a generic interface for all values that could exist in
 * context. It is used to constrain the context properties returned by various
 * middlewares to avoid different middlewares defining the same context under
 * different property names e.g `req` and `request`.
 */
export interface AppTRPCContext extends AppTRPCHandlerSuppliedContext {
  auth?: { user: User; session: Session } | null
}

export function createReqCookiesContextValue(req: Request) {
  const cookies = req.headers.get("Cookie") ?? ""
  const cookiesMap = new Map(Object.entries(cookie.parse(cookies)))
  return cookiesMap as ReadonlyMap<string, string>
}

/**
 * This creates the context used with the fetchRequestHandler used to serve the
 * whole TRPC router via HTTP.
 */
export function createFetchHandlerContext(
  options: FetchCreateContextFnOptions
) {
  return {
    db,
    handler: "http",
    req: options.req,
    resHeaders: options.resHeaders,
    reqCookies: createReqCookiesContextValue(options.req)
  } satisfies AppTRPCHandlerSuppliedContext
}
