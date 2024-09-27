import "server-only"

import { initTRPC } from "@trpc/server"
import type { TRPCAppFetchHandlerContext } from "./context"

/**
 * We define the context as partial because procedures might be called without
 * http e.g. via server side call or server-side helper, in which case the fetch
 * handler context will not be available
 * @link https://trpc.io/docs/server/context#inner-and-outer-context
 */
type Context = Partial<TRPCAppFetchHandlerContext>

const t = initTRPC.context<Context>().create({})
export const { router, procedure: baseProcedure } = t
