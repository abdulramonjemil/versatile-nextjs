import "server-only"

import { Google } from "arctic"
import { googleOAuthCallbackRoute } from "@/shared/routes"

import {
  SERVER_ENV_GOOGLE_OAUTH_CLIENT_ID,
  SERVER_ENV_GOOGLE_OAUTH_CLIENT_SECRET,
  SERVER_ENV_NODE_ENV
} from "@/env/server"

import { appCookieNames, type CookieConfigGetterList } from "@/shared/cookies"
import { PUBLIC_ENV_APP_HOST } from "@/env/shared"
import { tryFetch } from "@/shared/fetch"
import { AppHTTPResponseError } from "@/shared/errors/http"
import { z } from "zod"
import { tryFn } from "@/lib/error"

// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------------------------------------
// --------------  BASE EXPORTS  --------------
// --------------------------------------------

export const googleOAuth = new Google(
  SERVER_ENV_GOOGLE_OAUTH_CLIENT_ID,
  SERVER_ENV_GOOGLE_OAUTH_CLIENT_SECRET,
  googleOAuthCallbackRoute().url.href
)

export const GoogleOAuthScopes = {
  Email: "email",
  Profile: "profile"
} as const

// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// ---------------------------------------
// --------------  COOKIES  --------------
// ---------------------------------------

export const googleOAuthCookieConfigs = {
  // Lucia recommends Arctic for OAuth. A similar example of this cookie
  // setting can be found in the Arctic docs:
  // https://arctic.js.org/guides/oauth2-pkce
  state: () => ({
    name: appCookieNames.auth.googleOAuthState(),
    domain: PUBLIC_ENV_APP_HOST,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: SERVER_ENV_NODE_ENV === "production",
    maxAge: 60 * 10
  }),

  // Lucia recommends Arctic for OAuth. A similar example of this cookie
  // setting can be found in the Arctic docs:
  // https://arctic.js.org/guides/oauth2-pkce
  codeVerifier: () => ({
    name: appCookieNames.auth.googleOAuthCodeVerifier(),
    domain: PUBLIC_ENV_APP_HOST,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: SERVER_ENV_NODE_ENV === "production",
    maxAge: 60 * 10
  })
} as const satisfies CookieConfigGetterList

// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// --------------
// ----------------------------------------------
// --------------  USER INFO/DATA  --------------
// ----------------------------------------------

/**
 * This schema is adapted from the official documentation for Google's ID token
 * payload defined here:
 * https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload
 *
 * This data is gotten either by parsing the ID token payload (JWT) or by
 * calling the userinfo endpoint (which is done below). We are only interested
 * in a subset of the values provided by the endpoint, so this is not an
 * exhaustive schema.
 */
const googleUserInfoSchema = z.object({
  // User's unique identifier
  sub: z.string(),

  // According to the official schema, this field can be null (when the email
  // scope is not passed). However, we make this non-nullable to make sure that
  // we are always passing the "email" scope when starting auth requests, else
  // we get an error.
  email: z.string().email(),
  email_verified: z.boolean(),

  // `family_name` corresponds to surname. `given_name` is user's own name or
  // first name. `name` is their full name in a displayable form.
  family_name: z.string().nullable().catch(null),
  given_name: z.string().nullable().catch(null),
  name: z.string().nullable().catch(null),

  // User's profile
  picture: z.string().url().nullable().catch(null)
})

/**
 * This uses the `userinfo_endpoint` from Google's OIDC implementation.
 * - UserInfo endpoint: https://openidconnect.googleapis.com/v1/userinfo
 * - OpenID discovery document:
 *   https://developers.google.com/identity/openid-connect/openid-connect#discovery
 * - Standard OpenID claims:
 *   https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export async function getGoogleUserInfo(accessToken: string) {
  const userInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo"
  const request = new Request(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const [error, response, success] = await tryFetch(() => fetch(request))

  // A custom app error is not thrown since this fetch() call runs on the server
  // (no network issue) and the request is expected to go through (since we
  // define the request url and format), so any error should be rethrown to be
  // treated as an issue rather than an in-app error or a flow-control mechanism
  // for use in code.
  if (!success) {
    throw new Error("Request to fetch Google user data did not go through", {
      cause: error.value
    })
  }

  if (!response.ok) {
    // Throw a custom app error to make it possible for callers to treat the
    // error as a flow-control mechanism since the response error may be due to
    // invalid supplied access token.
    throw new AppHTTPResponseError({
      message: "Unable to fetch Google user info. Expected a 200 status.",
      code: AppHTTPResponseError.Codes.InvalidStatusCode,
      request,
      response
    })
  }

  const [parseError, info, parseSuccess] = await tryFn(async () => {
    const json = await (response.json() as Promise<unknown>)
    return googleUserInfoSchema.parse(json)
  })

  // Parsing should be successful since the data is fetched on the server. Any
  // error here should be treated as an issue/bug to be resolved rather than a
  // flow control mechanism, which is why we won't throw a custom app error.
  if (!parseSuccess) {
    throw new Error("Unable to parse user info response from Google", {
      cause: parseError
    })
  }

  return info
}
