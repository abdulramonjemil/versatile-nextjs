import "server-only"

import { tryFn } from "@/lib/error"
import {
  getGoogleUserInfo,
  googleOAuth,
  GoogleOAuthScopes
} from "@/server/auth/google"

import {
  googleOAuthCodeVerifierCookieConfig,
  googleOAuthStateCookieConfig
} from "@/shared/cookies"

import { baseProcedure, router } from "@/trpc/base"
import { createUser, getUserByEmail } from "@/trpc/routers/user"

import {
  authInfoMiddleware,
  requireHTTPContextMiddleware,
  requireAuthStateMiddleware,
  requireHandlerTypeMiddleware
} from "@/trpc/middlewares"

import { TRPCError } from "@trpc/server"
import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic"
import { setCookieHeader } from "@/server/headers"
import { lucia } from "@/server/auth/lucia"
import { homeRoute } from "@/shared/routes"

const getAuthUrlProcedure = baseProcedure
  .use(requireHTTPContextMiddleware())
  .use(authInfoMiddleware())
  .use(requireAuthStateMiddleware("unauthenticated"))
  .query(async (opts) => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const [error, authUrl] = await tryFn(() => {
      return googleOAuth.createAuthorizationURL(state, codeVerifier, {
        scopes: [GoogleOAuthScopes.Email, GoogleOAuthScopes.Profile]
      })
    })

    if (!authUrl) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to fetch auth url from Google",
        cause: error
      })
    }

    const sCookieConfig = googleOAuthStateCookieConfig()
    const cvCookieConfig = googleOAuthCodeVerifierCookieConfig()

    const sCookieHeader = setCookieHeader(
      sCookieConfig.name,
      state,
      sCookieConfig
    )

    const cvCookieHeader = setCookieHeader(
      cvCookieConfig.name,
      codeVerifier,
      cvCookieConfig
    )

    opts.ctx.resHeaders.append(sCookieHeader.name, sCookieHeader.value)
    opts.ctx.resHeaders.append(cvCookieHeader.name, cvCookieHeader.value)
    return { authUrl: authUrl.href }
  })

/**
 * This is used to handle the redirect from google, mainly because the url get
 * logic resides here too. However, this endpoint is not meant to be directly
 * used to handle auth callback from google. This is because, based on the
 * principles of TRPC, we should be returning JSON data, but using the procedure
 * to directly handle auth callback would require that we redirect after
 * confirming auth code. While we could get the redirect to work using some
 * hacks, we'll instead set a separate route in the app for Google auth
 * callback, use this procedure to handle the callback, and return appropriate
 * data for that route to manage to take the appropriate action e.g. redirect.
 *
 * That said, we still require the necessary http object (e.g. request), but
 * make sure to only allow direct calls from our server, rather than arbitrary
 * http access.
 */
const handleAuthCallbackProcedure = baseProcedure
  .use(requireHandlerTypeMiddleware("server"))
  .use(requireHTTPContextMiddleware())
  .query(
    async (
      opts
    ): Promise<
      | { codeValidated: true; redirectUrl: string }
      | { codeValidated: false; httpStatus: 400 | 500 }
    > => {
      const { ctx } = opts
      const requestURL = new URL(ctx.req.url)
      const code = requestURL.searchParams.get("code")
      const state = requestURL.searchParams.get("state")

      const stateCookieConfig = googleOAuthStateCookieConfig()
      const verifierCookieConfig = googleOAuthCodeVerifierCookieConfig()
      const storedState = ctx.reqCookies.get(stateCookieConfig.name) ?? null
      const storedCodeVerifier =
        ctx.reqCookies.get(verifierCookieConfig.name) ?? null

      if (
        !code ||
        !state ||
        !storedState ||
        !storedCodeVerifier ||
        state !== storedState
      ) {
        // We might also choose to redirect to an error page instead
        return { codeValidated: false, httpStatus: 400 }
      }

      const [tokensError, tokens] = await tryFn(() => {
        return googleOAuth.validateAuthorizationCode(code, storedCodeVerifier)
      })

      if (!tokens) {
        if (tokensError instanceof OAuth2RequestError) {
          // Can also redirect to an error page
          return { codeValidated: false, httpStatus: 400 } // Invalid OAuth code
        }
        return { codeValidated: false, httpStatus: 500 }
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

      const { name, value, attributes } = lucia.createSessionCookie(session.id)
      const h = setCookieHeader(name, value, attributes)
      opts.ctx.resHeaders.append(h.name, h.value)

      // Redirect to appropriate page
      return { codeValidated: true, redirectUrl: homeRoute().url.href }
    }
  )

export const googleAuthRouter = router({
  getAuthUrl: getAuthUrlProcedure,
  handleAuthCallback: handleAuthCallbackProcedure
})
