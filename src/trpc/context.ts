import "server-only"

import { db } from "@/db"
import { Session, User } from "@/server/auth/base"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

/**
 * This interface represents contexts supplied via the handler for the trpc
 * router. A handler is any means for instantiating access to the procedures
 * defined on the trpc router, and can be one of the following:
 * - http handler e.g. fetchRequestHandler
 * - createCaller()
 * - createServerSideHelpers() ... and so on
 *
 * Based on this, We make sure to specify context values that won't always be
 * available as optional. For example, http based context values `req` and
 * `resHeaders` may not necessarily be available when accessing the procedure
 * via `createCaller()` or helpers from `createServerSideHelpers()`.
 */
export interface AppTRPCHandlerSuppliedContext {
  db: typeof db
  handler: "http" | "server" // The handler calling the procedure
  req?: Request
  resHeaders?: Headers
}

/**
 * This is used as a generic interface for all values that could exist in
 * context. This is used to constrain the context properties returned by various
 * middlewares to avoid different middlewares defining the same context under
 * different property names e.g `req` and `request`.
 */
export interface AppTRPCContext extends AppTRPCHandlerSuppliedContext {
  reqCookies?: Record<string, string>
  auth?: { user: User; session: Session } | null
}

export function createFetchHandlerContext(
  options: FetchCreateContextFnOptions
) {
  return {
    db,
    handler: "http",
    req: options.req,
    resHeaders: options.resHeaders
  } satisfies AppTRPCHandlerSuppliedContext
}
