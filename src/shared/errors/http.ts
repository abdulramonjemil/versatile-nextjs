import { ValueOf } from "@/lib/types"
import { AppErrorNames, BaseAppError } from "./base"

// ----------------------------------------------------
// --------------  AppHTTPRequestError  ---------------
// ----------------------------------------------------

const AppHTTPRequestErrorCodes = {
  Aborted: "Aborted",
  Invalid: "Invalid" // Thrown if request couldn't go through e.g. bad network
} as const

export type AppHTTPRequestErrorCode = ValueOf<typeof AppHTTPRequestErrorCodes>
export interface AppHTTPRequestErrorOptions {
  message: string
  request: Request
  code: AppHTTPRequestErrorCode
  cause?: unknown
}

export class AppHTTPRequestError extends BaseAppError {
  static Codes = AppHTTPRequestErrorCodes

  name: typeof AppErrorNames.AppHTTPRequestError
  code: AppHTTPRequestErrorCode
  request: Request

  constructor(options: AppHTTPRequestErrorOptions) {
    const { message, code, request, cause } = options
    super(message, { cause })
    this.name = AppErrorNames.AppHTTPRequestError
    this.code = code
    this.request = request
  }
}

// -----------------------------------------------------
// --------------  AppHTTPResponseError  ---------------
// -----------------------------------------------------

const AppHTTPResponseErrorCodes = {
  InvalidBody: "InvalidBody",
  InvalidStatusCode: "InvalidStatusCode"
} as const

export type AppHTTPResponseErrorCode = ValueOf<typeof AppHTTPResponseErrorCodes>
export interface AppHTTPResponseErrorOptions {
  message: string
  request: Request
  response: Response
  code: AppHTTPResponseErrorCode
  cause?: unknown
}

export class AppHTTPResponseError extends BaseAppError {
  static Codes = AppHTTPResponseErrorCodes

  name: typeof AppErrorNames.AppHTTPResponseError
  code: AppHTTPResponseErrorCode
  request: Request
  response: Response

  constructor(options: AppHTTPResponseErrorOptions) {
    const { message, code, request, response, cause } = options
    super(message, { cause })
    this.name = AppErrorNames.AppHTTPResponseError
    this.code = code
    this.request = request
    this.response = response
  }
}
