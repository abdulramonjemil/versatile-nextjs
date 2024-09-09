import { tryFn } from "@/lib/error"
import { JSONObject, JSONValue } from "@/lib/types"

function encodeSearchParamValue(value: JSONValue): string {
  if (value === null) {
    return "_null"
  }

  if (typeof value === "boolean") {
    return `_${value}`
  }

  if (typeof value === "number") {
    return `_${String(value)}` // String has shape `_${number}`
  }

  if (Array.isArray(value)) {
    return `_${JSON.stringify(value)}` // String begins with `_[`
  }

  if (typeof value === "object") {
    return `_${JSON.stringify(value)}` // String begins with `_{`
  }

  if (typeof value === "string") {
    // Escape "_" since it is used to escape non-string values
    if (value.startsWith("_")) return `_${value}` // String begins with `__`
    return value
  }

  // Unexpected type, should not occure if using TypeScript well
  throw new TypeError(`Cannot encode value of type '${typeof value}'`)
}

function decodeSearchParamValue(value: string): unknown {
  if (value === "_null") {
    return null
  }

  if (value === "_true" || value === "_false") {
    return value === "_true"
  }

  const isNumberString = (v: string) => v === "NaN" || !Number.isNaN(Number(v))
  if (value.startsWith("_") && isNumberString(value.substring(1))) {
    return Number(value.substring(1))
  }

  if (value.startsWith("_[")) {
    return JSON.parse(value.substring(1)) // encoded array
  }

  if (value.startsWith("_{")) {
    return JSON.parse(value.substring(1)) // encoded object
  }

  // Actual string value
  if (value.startsWith("__")) return value.substring(1) // escaped with additional _
  if (!value.startsWith("_")) return value

  // Starts with "_", is not specially treated, and is not escaped with another "_"
  throw new TypeError(`Cannot interprete value beginning with _: ${value}`)
}

/** Convert a JSON object to a valid URLSearchParams object */
export function encodeToSearchParams(object: JSONObject) {
  const searchParams = new URLSearchParams()
  Object.entries(object).forEach(([key, value]) => {
    searchParams.set(key, encodeSearchParamValue(value))
  })
  return searchParams
}

/**
 * Convert a URLSearchParams object to a json value. The return value should be
 * further validated by a validation library like zod
 */
export function decodeFromSearchParams(searchParams: URLSearchParams) {
  const object = {} as Record<string, unknown>
  searchParams.forEach((value, key) => {
    // Ignore error since user may pass arbitrary data in search params
    // Further validation should be done using a library like zod with fallbacks
    const [, val, success] = tryFn(() => decodeSearchParamValue(value))
    if (success) object[key] = val
  })
  return object
}
