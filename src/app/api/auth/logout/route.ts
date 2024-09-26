import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { googleOAuthInitRoute } from "@/shared/routes"
import { lucia } from "@/server/auth/lucia"

export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  const session = sessionId
    ? (await lucia.validateSession(sessionId)).session
    : null

  if (!session) {
    return new Response(null, { status: 401 }) // Unauthorized
  }

  await lucia.invalidateSession(session.id)
  const cookie = lucia.createBlankSessionCookie()
  cookies().set(cookie.name, cookie.value, cookie.attributes)

  // Redirect to login page. This should be changed as needed
  redirect(googleOAuthInitRoute().url.href)
}
