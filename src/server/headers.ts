import "server-only"

import cookie from "cookie"
import { HeaderGetter } from "@/shared/headers"

export const setCookieHeader = ((
  ...params: Parameters<typeof cookie.serialize>
) => {
  return { name: "Set-Cookie", value: cookie.serialize(...params) }
}) satisfies HeaderGetter
