export type FunctionTrialResult<TReturn, TError> =
  | [error: null, output: TReturn, success: true]
  | [error: TError, output: null, success: false]

// This allows distribution of TReturn in case the return type is a union of a
// promise and non-promise value.
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type TryFnReturn<TReturn, TError> =
  TReturn extends Promise<unknown>
    ? Promise<FunctionTrialResult<Awaited<TReturn>, TError>>
    : FunctionTrialResult<TReturn, TError>

export function tryFn<TReturn, TError = unknown>(
  fn: () => TReturn
): TryFnReturn<TReturn, TError> {
  try {
    const result = fn.call(null)
    if (result instanceof Promise) {
      return result.then(
        (res) => [null, res, true],
        (error) => [error, null, false]
      ) as TryFnReturn<TReturn, TError>
    }

    // Handle sync function success
    return [null, result, true] as TryFnReturn<TReturn, TError>
  } catch (error) {
    // Handle sync function error
    return [error, null, false] as TryFnReturn<TReturn, TError>
  }
}
