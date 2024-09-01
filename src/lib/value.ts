export function assertIsDefined<T>(
  value: T,
  desc: string
): asserts value is Exclude<T, undefined | null> {
  if (value === undefined || value === null) {
    throw new Error(`Expected '${desc}' to be defined, got '${String(value)}'`)
  }
}

export function assertCondition(
  condition: boolean,
  desc: string
): asserts condition {
  if (condition !== true) {
    throw new Error(`Expected '${desc}' to be true`)
  }
}

export function forceGetNonEmptyString(value: unknown, desc: string) {
  assertCondition(
    typeof value === "string" && value !== "",
    `${desc} is non-empty string`
  )
  return value
}
