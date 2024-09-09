import { sql } from "drizzle-orm"
import type { AnyPgColumn } from "drizzle-orm/pg-core"

export function lower(column: AnyPgColumn) {
  return sql`lower(${column})`
}
