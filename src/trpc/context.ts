import "server-only"

import { cache } from "react"
import { db } from "@/db/base"

export const createTRPCContext = cache(() => {
  return { db }
})
