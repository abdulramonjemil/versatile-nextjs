import "server-only"

import { generateIdFromEntropySize } from "lucia"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { type UserInsert, usersTable } from "@/db/schema"
import { lower } from "@/db/utils"

export async function createUser(
  user: Omit<UserInsert, "id" | "createdAt" | "updatedAt">
) {
  // More on the ID generation function in Lucia Docs
  // https://lucia-auth.com/basics/users#create-user
  const userId = generateIdFromEntropySize(10) // 16 characters long
  const [createdUser] = await db
    .insert(usersTable)
    .values({ ...user, id: userId, email: user.email.toLowerCase() })
    .returning()
  return createdUser!
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(lower(usersTable.email), email.toLowerCase()))
  return user ?? null
}
