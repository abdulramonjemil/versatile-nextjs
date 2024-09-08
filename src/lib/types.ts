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
