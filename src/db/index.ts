import "server-only"

import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { SERVER_ENV_NEON_DB_CONNECTION_STRING } from "@/env/server"
import { schema } from "./schema"

const sql = neon(SERVER_ENV_NEON_DB_CONNECTION_STRING)
export const db = drizzle(sql, { schema })
