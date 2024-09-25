import { PUBLIC_ENV_APP_HOST, PUBLIC_ENV_NODE_ENV } from "@/env/shared"

export interface CookieConfig {
  // Only `name` is required because it is the only value that should be
  // decidable regardless of whether the code trying to access the cookie config
  // is a reader (not setting cookie value) or a setter. Other values may depend
  // on parameters that make sense only when the calling code is trying to set
  // cookie value e.g. `expires`, which may be based on context of the setter.
  name: string
  domain?: string
  path?: string
  httpOnly?: boolean
  sameSite?: "strict" | "lax"
  secure?: boolean
  expires?: Date | false // `false` is allowed here because Lucia allows it
  maxAge?: number
}

export type CookieConfigGetter = (...params: any[]) => CookieConfig

export const sessionTokenCookieConfig = (() => ({
  name: "session_token",
  domain: PUBLIC_ENV_APP_HOST,
  path: "/",
  httpOnly: true,
  sameSite: "strict",
  secure: PUBLIC_ENV_NODE_ENV === "production",
  // Session expiration should be based on DB session, not cookie, see session
  // schema for more details
  expires: false
})) satisfies CookieConfigGetter

export const googleOAuthStateCookieConfig = (() => ({
  name: "google_oauth_state",
  domain: PUBLIC_ENV_APP_HOST,
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: PUBLIC_ENV_NODE_ENV === "production",
  maxAge: 60 * 10
})) satisfies CookieConfigGetter

// Lucia recommends Arctic for OAuth. A similar example of this cookie
// setting can be found in the Arctic docs:
// https://arctic.js.org/guides/oauth2-pkce
export const googleOAuthCodeVerifierCookieConfig = (() => ({
  name: "google_oauth_code_verifier",
  domain: PUBLIC_ENV_APP_HOST,
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: PUBLIC_ENV_NODE_ENV === "production",
  maxAge: 60 * 10
})) satisfies CookieConfigGetter
