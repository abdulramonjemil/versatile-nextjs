import "server-only"

import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { SERVER_ENV_NEON_DB_CONNECTION_STRING } from "@/env/server"

// Use the following when using `db.query.<table>` syntax
// Schema can get very big so it is omitted by default
const sql = neon(SERVER_ENV_NEON_DB_CONNECTION_STRING)
// export const db = drizzle(sql, { schema })
export const db = drizzle(sql)
