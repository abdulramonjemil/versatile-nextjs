import "server-only"

import { router } from "./base"
import { authRouter } from "./routers/auth"
import { testRouter } from "./routers/test"
import { userRouter } from "./routers/user"

// @todo starter::Update the TRPC procedures and remove test router
export const appRouter = router({
  auth: authRouter,
  test: testRouter,
  user: userRouter
})

// export type definition of API
export type AppTRPCRouter = typeof appRouter
