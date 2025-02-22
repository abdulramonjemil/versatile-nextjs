import "server-only"

import {
  GetRawInputFn,
  MiddlewareResult
} from "@trpc/server/unstable-core-do-not-import"

import { baseProcedure } from "@/trpc/base"
import { AppTRPCContext } from "@/trpc/context"

type AppTRPCMiddleware = Extract<
  Parameters<typeof baseProcedure.use>[0],
  (...args: any[]) => unknown
>

type AppTRPCMiddlewareReturn = ReturnType<AppTRPCMiddleware>
type AppTRPCMiddlewareContextOverride = Partial<AppTRPCContext>

/**
 * By inspecting the type of the `next` function on the options, the type can
 * simply be written as follows, even though the actual function type is
 * overloaded. We take advantage of this to restrict the type of the context
 * override.
 */
type AppTRPCMiddlewareOptionsNextFn = <
  ContextOverride extends AppTRPCMiddlewareContextOverride = object
>(opts?: {
  ctx?: ContextOverride
  input?: unknown
  getRawInput?: GetRawInputFn
}) => Promise<MiddlewareResult<ContextOverride>>

type AppTRPCMiddlewareOptions = Omit<
  Parameters<AppTRPCMiddleware>[0],
  "next"
> & { next: AppTRPCMiddlewareOptionsNextFn }

type AppTRPCBuiltMiddlewareOptions<MiddlewareBuilder> =
  // eslint-disable-next-line no-use-before-define
  MiddlewareBuilder extends AppTRPCMiddlewareBuilder<infer RequiredContextValue>
    ? {
        [K in keyof AppTRPCMiddlewareOptions]: K extends "ctx"
          ? Omit<AppTRPCMiddlewareOptions["ctx"], RequiredContextValue> &
              Pick<Required<AppTRPCContext>, RequiredContextValue>
          : AppTRPCMiddlewareOptions[K]
      }
    : never

class AppTRPCMiddlewareBuilder<
  RequiredContextValue extends keyof AppTRPCContext = never
> {
  // eslint-disable-next-line class-methods-use-this
  create<TParams extends unknown[], TReturn extends AppTRPCMiddlewareReturn>(
    def: (
      opts: AppTRPCBuiltMiddlewareOptions<
        AppTRPCMiddlewareBuilder<RequiredContextValue>
      >,
      ...params: TParams
    ) => TReturn
  ) {
    return (
      ...params: TParams
    ): ((
      opts: AppTRPCBuiltMiddlewareOptions<
        AppTRPCMiddlewareBuilder<RequiredContextValue>
      >
    ) => TReturn) => {
      return (opts) => def(opts, ...params)
    }
  }

  /**
   * This allows for specifying contexts which might be optional (on the context
   * interface) as required on the type of the generated middleware
   */
  // eslint-disable-next-line class-methods-use-this
  requiredContextValue<RequiredCtxValue extends keyof AppTRPCContext>() {
    return new AppTRPCMiddlewareBuilder<RequiredCtxValue>()
  }
}

// By default, no optional context should be required, so we use `never`
// eslint-disable-next-line import/export
export const appTRPCMiddleware = new AppTRPCMiddlewareBuilder()

// eslint-disable-next-line @typescript-eslint/no-namespace, import/export
export namespace appTRPCMiddleware {
  export type options<MiddlewareBuilder> =
    AppTRPCBuiltMiddlewareOptions<MiddlewareBuilder>
}
