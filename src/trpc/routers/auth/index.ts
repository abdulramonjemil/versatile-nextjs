import "server-only"

import { router } from "@/trpc/base"
import { googleAuthRouter } from "./google"

export const authRouter = router({
  google: googleAuthRouter
})
