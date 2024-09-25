import "server-only"

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from "@/db"

import { type SessionSelect, type UserSelect, schema } from "@/db/schema"

import { Lucia, TimeSpan } from "lucia"
import { sessionCookieConfigs } from "./session"

const adapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users)
const cookieConfig = sessionCookieConfigs.token({ expires: false })

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"),
  sessionCookie: {
    name: cookieConfig.name,
    expires: cookieConfig.expires,
    attributes: {
      sameSite: cookieConfig.sameSite,
      secure: cookieConfig.secure,
      domain: cookieConfig.domain,
      path: cookieConfig.path
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
interface DatabaseUserAttributes extends Omit<UserSelect, "id"> {}

// Exclude fields that are automatically added by Lucia
interface DatabaseSessionAttributes
  extends Omit<SessionSelect, "id" | "userId" | "expiresAt"> {}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
    DatabaseSessionAttributes: DatabaseSessionAttributes
  }
}
