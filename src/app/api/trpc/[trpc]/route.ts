import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createFetchHandlerContext } from "@/trpc/context"
import { appRouter } from "@/trpc/server"

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createFetchHandlerContext
  })
}

export { handler as GET, handler as POST }
