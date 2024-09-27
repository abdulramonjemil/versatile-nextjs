export type ValueOf<T> = T[keyof T]

export type JSONObject = { [key: string]: JSONValue } // eslint-disable-line
export type JSONArray = JSONValue[] // eslint-disable-line
export type JSONValue =
  | null
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray

/**
 * This gives the various paths to the deepest keys in an object as a tuple e.g.
 * - { one: { a: true, b: true }, two: "" } => ["one", "a"] | ["one", "b"] | ["two"]
 */
export type DeepKeyPaths<Obj, Prefix extends unknown[] = []> = {
  [K in keyof Obj]: Obj[K] extends Record<string, unknown>
    ? DeepKeyPaths<Obj[K], [...Prefix, K]>
    : [...Prefix, K]
}[keyof Obj]
