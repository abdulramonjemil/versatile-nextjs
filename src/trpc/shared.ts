import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"

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
