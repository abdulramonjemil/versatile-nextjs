import "server-cli-only"

import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

// @todo starter::Change the database schema to suit your needs
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
})

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

export const schema = {
  users: usersTable,
  sessions: sessionsTable
}

export type UserInsert = typeof usersTable.$inferInsert
export type UserSelect = typeof usersTable.$inferSelect
export type SessionInsert = typeof sessionsTable.$inferInsert
export type SessionSelect = typeof sessionsTable.$inferSelect
