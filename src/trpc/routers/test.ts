import { baseProcedure, router } from "@/trpc/base"

const testGreetingProcedure = baseProcedure.query(() => ({
  message: "Hello world!"
}))

export const testRouter = router({
  greet: testGreetingProcedure
})
