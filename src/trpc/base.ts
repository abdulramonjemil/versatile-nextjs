import "server-only"

import { initTRPC } from "@trpc/server"

// Avoid exporting the entire t-object since it's not very descriptive.
const trpc = initTRPC.create({})

export const { router, procedure: baseProcedure } = trpc
