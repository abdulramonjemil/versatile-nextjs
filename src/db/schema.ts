import "server-cli-only"

import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { lower } from "./utils"

// @todo starter::Change the database schema to suit your needs
export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
  },
  (table) => {
    return {
      // It's good practice to include tablename, index type, and column names
      // in index name, which is why "users_uqx_email" is used.
      emailUniqueIndex: uniqueIndex("users_uqx_email").on(lower(table.email))
    }
  }
)

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
})

export const schema = { usersTable, sessionsTable }

export type UserInsert = typeof usersTable.$inferInsert
export type UserSelect = typeof usersTable.$inferSelect
export type SessionInsert = typeof sessionsTable.$inferInsert
export type SessionSelect = typeof sessionsTable.$inferSelect
