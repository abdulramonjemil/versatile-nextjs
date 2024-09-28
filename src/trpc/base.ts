import "server-only"

import { initTRPC } from "@trpc/server"
import type { AppTRPCHandlerSuppliedContext } from "./context"

const t = initTRPC.context<AppTRPCHandlerSuppliedContext>().create({})
export const { router, procedure: baseProcedure } = t
