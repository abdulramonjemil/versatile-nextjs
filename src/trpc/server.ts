import "server-only"

import { router } from "./base"
import { testRouter } from "./routers/test"
import { authRouter } from "./routers/auth"

// @todo starter::Update the TRPC procedures and remove test router
export const appRouter = router({
  auth: authRouter,
  test: testRouter
})

// export type definition of API
export type AppTRPCRouter = typeof appRouter
