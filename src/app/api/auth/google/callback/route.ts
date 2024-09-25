import { tryFn } from "@/lib/error"
import {
  getGoogleUserInfo,
  googleOAuth,
  googleOAuthCookieConfigs
} from "@/server/auth/google"
import { lucia } from "@/server/auth/lucia"
import { createUser, getUserByEmail } from "@/server/auth/user"
import { appRouteUrls } from "@/shared/routes"
import { OAuth2RequestError } from "arctic"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  const requestURL = new URL(request.url)
  const code = requestURL.searchParams.get("code")
  const state = requestURL.searchParams.get("state")

  const stateCookieConfig = googleOAuthCookieConfigs.state()
  const verifierCookieConfig = googleOAuthCookieConfigs.codeVerifier()
  const storedState = cookies().get(stateCookieConfig.name)?.value ?? null
  const storedCodeVerifier =
    cookies().get(verifierCookieConfig.name)?.value ?? null

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    // This may also be a redirect to an error page
    return new Response(null, { status: 400 })
  }

  const [tokensError, tokens] = await tryFn(() => {
    return googleOAuth.validateAuthorizationCode(code, storedCodeVerifier)
  })

  if (!tokens) {
    if (tokensError instanceof OAuth2RequestError) {
      // Can also redirect to an error page Error is handled specially because
      // `code` could be invalid as a result of user error, else, the global
      // error (for all routes should be the one handling the error)
      return new Response(null, { status: 400 }) // Invalid OAuth code
    }
    return new Response(null, { status: 500 })
  }

  const userInfo = await getGoogleUserInfo(tokens.accessToken)
  const existingUser = await getUserByEmail(userInfo.email)

  // Create new user if not exists
  const user =
    existingUser ??
    (await createUser({
      email: userInfo.email,
      firstName: userInfo.given_name ?? "",
      lastName: userInfo.family_name ?? ""
    }))

  const currentDate = new Date()
  const session = await lucia.createSession(user.id, {
    createdAt: currentDate,
    updatedAt: currentDate
  })

  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )

  // Redirect to appropriate page
  redirect(appRouteUrls.home())
}
