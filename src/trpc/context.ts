import "server-only"

import { cache } from "react"
import { db } from "@/db"

export const createTRPCContext = cache(() => {
  return { db }
})
