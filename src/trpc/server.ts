import "server-only"

import { router } from "./base"
import { testRouter } from "./routers/test"

// @todo starter::Update the TRPC procedures as needed
export const appRouter = router({
  // Make sure to remove test procedure
  test: testRouter
})

// export type definition of API
export type TRPCAppRouter = typeof appRouter
