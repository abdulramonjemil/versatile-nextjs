import { ValueOf } from "@/lib/types"
import type { AppHTTPRequestError, AppHTTPResponseError } from "./http"

export const AppErrorNames = {
  AppHTTPRequestError: "AppHTTPRequestError",
  AppHTTPResponseError: "AppHTTPResponseError"
} as const

const AppErrorNameSet = new Set(Object.values(AppErrorNames) as string[])
export type AppErrorName = ValueOf<typeof AppErrorNames>
export type AppError = AppHTTPRequestError | AppHTTPResponseError

export abstract class BaseAppError extends Error {
  abstract name: AppErrorName
}

/**
 * This allows to treat errors as a flow-control mechanism by checking against a
 * known set of custom app errors that may be handled in code. Errors that this
 * function returns `false` for are meant to be treated as bugs/issues and
 * should not handled within code, but instead rethrown to trigger error
 * reporting or similar.
 */
export function isAppError(value: unknown): value is AppError {
  return value instanceof BaseAppError && AppErrorNameSet.has(value.name)
}
