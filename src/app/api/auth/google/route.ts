import { tryFn } from "@/lib/error"
import {
  googleOAuth,
  GoogleOAuthScopes,
  googleOAuthCookieConfigs
} from "@/server/auth/google"

import { lucia } from "@/server/auth/lucia"
import { appRouteUrls } from "@/shared/routes"
import { generateCodeVerifier, generateState } from "arctic"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET() {
  // Check if user is logged in and redirect them to home page
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  if (sessionId) {
    const { session } = await lucia.validateSession(sessionId)
    if (session !== null) {
      if (session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        )
      }
      redirect(appRouteUrls.home())
    }

    const sessionCookie = lucia.createBlankSessionCookie()
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
  }

  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const [, authUrl] = await tryFn(() => {
    return googleOAuth.createAuthorizationURL(state, codeVerifier, {
      scopes: [GoogleOAuthScopes.Email, GoogleOAuthScopes.Profile]
    })
  })

  if (!authUrl) return new Response(null, { status: 500 })
  const stateCookieConfig = googleOAuthCookieConfigs.state()
  const verifierCookieConfig = googleOAuthCookieConfigs.codeVerifier()

  cookies().set(stateCookieConfig.name, state, {
    secure: stateCookieConfig.secure,
    path: stateCookieConfig.path,
    httpOnly: stateCookieConfig.httpOnly,
    maxAge: stateCookieConfig.maxAge
  })

  cookies().set(verifierCookieConfig.name, codeVerifier, {
    secure: verifierCookieConfig.secure,
    path: verifierCookieConfig.path,
    httpOnly: verifierCookieConfig.httpOnly,
    maxAge: verifierCookieConfig.maxAge
  })

  redirect(authUrl.href)
}
