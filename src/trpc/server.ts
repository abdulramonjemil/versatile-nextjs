import "server-only"

import { router, baseProcedure } from "./base"

// @todo starter::Update the TRPC procedures as needed
export const appRouter = router({
  // Make sure to remove test procedure
  test: baseProcedure.query(() => ({ message: "Hello world!" }))
})

// export type definition of API
export type TRPCAppRouter = typeof appRouter
