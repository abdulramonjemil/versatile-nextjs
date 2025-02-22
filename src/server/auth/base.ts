import "server-only"

import type { SessionSelect, UserSelect } from "@/db/schema"

export interface User extends UserSelect {}
export interface Session extends SessionSelect {}
