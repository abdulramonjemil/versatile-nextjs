import "server-only"

import { db } from "@/db"
import { Session, User } from "@/server/auth/base"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export interface TRPCAppFetchHandlerContext {
  req: Request
  resHeaders: Headers
}

/**
 * This is used as a generic interface for all values that could exist in
 * context. This is used to constrain the context properties returned by various
 * middlewares to avoid different middlewares defining the same context under
 * different property names e.g `req` and `request`.
 *
 * We also make sure to make all of these optional as we'll only be including
 * the properties as needed using middlewares. The only context that is supplied
 * via an adapter are the http related ones (`req` and `resHeaders`) but even
 * these might not be supplied when invoking a procedure via server-side callers
 * or server-side helpers.
 * @link https://trpc.io/docs/server/server-side-calls
 * @link https://trpc.io/docs/client/nextjs/server-side-helpers
 * @link https://trpc.io/docs/server/context#inner-and-outer-context
 */
export interface TRPCAppContext extends Partial<TRPCAppFetchHandlerContext> {
  reqCookies?: Record<string, string>
  db?: typeof db
  auth?: { user: User; session: Session } | { user: null; session: null }
}

export function createFetchHandlerContext(
  options: FetchCreateContextFnOptions
): TRPCAppFetchHandlerContext {
  return {
    req: options.req,
    resHeaders: options.resHeaders
  }
}
