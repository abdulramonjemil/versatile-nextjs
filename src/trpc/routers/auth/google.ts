import "server-only"

import { tryFn } from "@/lib/error"
import { googleOAuth, GoogleOAuthScopes } from "@/server/auth/google"
import {
  googleOAuthCodeVerifierCookieConfig,
  googleOAuthStateCookieConfig
} from "@/shared/cookies"
import { baseProcedure, router } from "@/trpc/base"

import {
  authSessionInfoMiddleware,
  requestCookiesMiddleware,
  requireFetchHandlerContextMiddleware,
  requireMissingAuthSessionMiddleware
} from "@/trpc/middlewares"

import { TRPCError } from "@trpc/server"
import { generateCodeVerifier, generateState } from "arctic"
import { setCookieHeader } from "@/server/headers"

const getAuthUrlProcedure = baseProcedure
  .use(requireFetchHandlerContextMiddleware())
  .use(requestCookiesMiddleware())
  .use(authSessionInfoMiddleware())
  .use(requireMissingAuthSessionMiddleware())
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

export const googleAuthRouter = router({
  getAuthUrl: getAuthUrlProcedure
})
