import "server-only"

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from "@/db"
import { sessionTokenCookieConfig } from "@/shared/cookies"
import { sessionsTable, usersTable } from "@/db/schema"

import { Lucia, TimeSpan } from "lucia"
import type { Session, User } from "./base"

const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable)
const sessionCookieConfig = sessionTokenCookieConfig()

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"), // 2 weeks
  sessionCookie: {
    name: sessionCookieConfig.name,
    // Expiration of session in the DB is more important (30 days by default).
    // The session cookie has a long expiration (2 years according to
    // https://lucia-auth.com/basics/configuration#sessioncookie)
    expires: sessionCookieConfig.expires,
    attributes: {
      sameSite: sessionCookieConfig.sameSite,
      secure: sessionCookieConfig.secure,
      domain: sessionCookieConfig.domain,
      path: sessionCookieConfig.path
    }
  },

  getSessionAttributes(attributes) {
    return {
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt
    }
  },

  getUserAttributes(attributes) {
    return {
      email: attributes.email,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt
    }
  }
})

// Exclude fields that are automatically added by Lucia
interface DatabaseUserAttributes extends Omit<User, "id"> {}

// Exclude fields that are automatically added by Lucia
interface DatabaseSessionAttributes
  extends Omit<Session, "id" | "userId" | "expiresAt"> {}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
    DatabaseSessionAttributes: DatabaseSessionAttributes
  }
}
