import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"
import type { DeepKeyPaths } from "@/lib/types"
import type { AppTRPCRouter } from "./server"

/**
 * While it looks like this should be a client only function, it can actually be
 * used both on the server and the client, particularly for prefetching
 * @link https://trpc.io/docs/client/react/server-components#4-create-a-query-client-factory
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, it is important to set a staleTime value greater than 0 to
        // avoid refetching immediately on the client
        staleTime: 30 * 1000
      },
      dehydrate: {
        // Include pending queries in dehydration. This works because React
        // supports promise hydration over the network. See
        // https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#streaming-with-server-components
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending"
      },
      hydrate: {}
    }
  })
}

interface TRPCProcedure {
  _def: { procedure: true }
}

/**
 * Procedure groups result from merging and nesting routers/procedures:
 * @link https://trpc.io/docs/server/merging-routers
 */
interface TRPCProcedureGroup {
  [x: string]: TRPCProcedure | TRPCProcedureGroup
}

/**
 * This simpler type in defined based on the return type of `t.router()`
 */
interface TRPCRouter {
  _def: { router: true; procedures: TRPCProcedureGroup }
}

type TRPCProcedureGroupShape<P extends TRPCProcedureGroup> = {
  [K in keyof P]: P[K] extends TRPCProcedureGroup
    ? TRPCProcedureGroupShape<P[K]>
    : true // TRPC procedure
}

export type TRPCRouterProceduresShape<R extends TRPCRouter> =
  TRPCProcedureGroupShape<R["_def"]["procedures"]>

// A union of tuples where each tuple is the segments for each procedure
export type AppTRPCRouterProcedurePathSegments = DeepKeyPaths<
  TRPCRouterProceduresShape<AppTRPCRouter>
>

/**
 * Gives the path to the TRPC procedure ensuring typesafety. For example, if we
 * have a procedure at path `auth.login`, then we can get that via
 * `procedurePath(["auth", "login"])`. Passing a wrong path will cause
 * TypeScript to throw a compilation error
 */
export function procedurePath(segments: AppTRPCRouterProcedurePathSegments) {
  return segments.join(".")
}
