import "server-only"

import { eq } from "drizzle-orm"
import { generateIdFromEntropySize } from "lucia"

import { router } from "@/trpc/base"
import { db } from "@/db"
import { UserInsert, usersTable } from "@/db/schema"
import { lower } from "@/db/utils"
import { User } from "@/server/auth/base"

/**
 * This function and other similar ones that aren't procedures is used by another procedure outside of the users namespace
 * which is why it is exported. Using a separate function in multiple procedures
 * is the recommended approach recommended by TRPC rather than using a server
 * side caller from within another procedure.
 *
 * @link https://trpc.io/docs/server/server-side-calls
 */
export async function createUser(
  user: Omit<UserInsert, "id" | "createdAt" | "updatedAt">
): Promise<User> {
  // More on the ID generation function in Lucia Docs
  // https://lucia-auth.com/basics/users#create-user
  const userId = generateIdFromEntropySize(10) // 16 characters long
  const [createdUser] = await db
    .insert(usersTable)
    .values({ ...user, id: userId, email: user.email.toLowerCase() })
    .returning()
  return createdUser!
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(lower(usersTable.email), email.toLowerCase()))
  return user ?? null
}

export const userRouter = router({})
