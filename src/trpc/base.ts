import "server-only"

import { initTRPC } from "@trpc/server"

// Avoid exporting the entire t-object since it's not very descriptive.
const t = initTRPC.create({})

export const { router } = t
export const baseProcedure = t.procedure
