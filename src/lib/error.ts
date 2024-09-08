export type FunctionTrialResult<
  SuccessResult,
  Err,
  DataKey extends string = "data",
  ErrorKey extends string = "error"
> =
  | ({ success: true } & { [K in DataKey]: SuccessResult } & {
      [K in ErrorKey]?: never
    } extends infer T
      ? { [K in keyof T]: T[K] }
      : never)
  | ({ success: false } & { [K in DataKey]?: never } & {
      [K in ErrorKey]: Err
    } extends infer T
      ? { [K in keyof T]: T[K] }
      : never)

export function tryFn<SuccessResult, Err = unknown>(
  fn: () => Promise<SuccessResult>
): Promise<FunctionTrialResult<SuccessResult, Err>>

export function tryFn<SuccessResult, Err = unknown>(
  fn: () => SuccessResult
): FunctionTrialResult<SuccessResult, Err>

export function tryFn(fn: () => unknown): unknown {
  type GenericResult = FunctionTrialResult<unknown, unknown>
  try {
    const result = fn.call(null)

    // Handle async function
    if (result instanceof Promise) {
      return result
        .then((res) => ({ success: true, data: res }) satisfies GenericResult)
        .catch((error) => ({ success: false, error }) satisfies GenericResult)
    }

    // Handle sync function success
    return { success: true, data: result } satisfies GenericResult
  } catch (error) {
    // Handle sync function error
    return { success: false, error } satisfies GenericResult
  }
}
