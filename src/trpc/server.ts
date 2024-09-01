import "server-only"

import { router, baseProcedure } from "./base"

export const appRouter = router({
  // Make sure to remove test procedure
  test: baseProcedure.query(() => ({ message: "Hellow world!" }))
})

// export type definition of API
export type TRPCAppRouter = typeof appRouter
