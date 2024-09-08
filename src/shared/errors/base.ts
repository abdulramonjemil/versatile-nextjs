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

export function isAppError(value: unknown): value is AppError {
  return value instanceof BaseAppError && AppErrorNameSet.has(value.name)
}
