import { generateIdFromEntropySize } from "lucia"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { schema as t, UserInsert } from "@/db/schema"
import { lower } from "@/db/utils"

export async function createUser(
  user: Omit<UserInsert, "id" | "createdAt" | "updatedAt">
) {
  // More on the ID generation function in Lucia Docs
  // https://lucia-auth.com/basics/users#create-user
  const userId = generateIdFromEntropySize(10) // 16 characters long
  const [createdUser] = await db
    .insert(t.users)
    .values({ ...user, id: userId, email: user.email.toLowerCase() })
    .returning()
  return createdUser!
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(t.users)
    .where(eq(lower(t.users.email), email.toLowerCase()))
  return user ?? null
}
