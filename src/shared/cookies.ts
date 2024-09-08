// This defines only cookie configuration options that are expected to be static
// for a particular cookie. Some keys may be made optional later on if needed.
// Other cookie configuration options like `expires` are to be determined by the
// executing code. Since it isn't static, including it here would mean that the
// getter functions have to take a parameter defining, and that would also mean
// that code that just wants to get cookie without setting would have to provide
// the argument (`expires` in this case) which is not very fine.
export interface CookieConfig {
  name: string
  domain?: string
  path?: string
  httpOnly?: boolean
  sameSite?: "strict" | "lax"
  secure?: boolean
  // Optional attributes to make it possible for code that only gets cookies to
  // work with the cookie helpers. These are mostly dynamic values.
  // `expires: false` is allowed because packages like Lucia accept it. It
  // doesn't really matter though since this is a dynamic attribute and the
  // calling code would be the one to define its value in the config anyways
  // (ideally through a parameter)
  expires?: Date | false
  maxAge?: number
}

export type CookieConfigGetter = (...params: any[]) => CookieConfig
export type ExtraCookieConfig<K extends keyof CookieConfig> = Pick<
  CookieConfig,
  K
>

export interface CookieConfigGetterList {
  [x: string]: CookieConfigGetter | CookieConfigGetterList
}

// A single source of truth for cookie names
export const appCookieNames = {
  auth: {
    sessionToken: () => "session_token",
    googleOAuthState: () => "google_oauth_state",
    googleOAuthCodeVerifier: () => "google_oauth_code_verifier"
  }
} as const
