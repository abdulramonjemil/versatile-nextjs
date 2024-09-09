import { type FunctionTrialResult, tryFn } from "@/lib/error"
import {
  type AppHTTPRequestErrorCode,
  AppHTTPRequestError
} from "./errors/http"

/**
 * A simple helper to wrap fetch() calls to easily create and throw custom
 * application error (AppHTTPRequestError) if necessary rather than `TypeError`
 * and `DOMException` which are thrown by fetch() by default.
 *
 * The fetcher function is expected to be a plain call to fetch() and should do
 * nothing else. We make sure to not use any web-specific API so it works on
 * both client and server.
 *
 * The error handling is according to the types specified here:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
 */
export async function tryFetch(
  fetcher: () => Promise<Response>
): Promise<
  FunctionTrialResult<Response, { code: AppHTTPRequestErrorCode; value: Error }>
> {
  const [error, response, success] = await tryFn(() => fetcher())
  if (success) return [null, response, true]

  const err = {
    value: error as Error,
    code:
      (error as Error).name === "AbortError"
        ? AppHTTPRequestError.Codes.Aborted
        : AppHTTPRequestError.Codes.Invalid
  }
  return [err, null, false]
}
