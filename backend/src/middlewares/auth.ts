import type { NextFunction, Request, Response } from "express"
import { AppError } from "@/utils/api"
import { env } from "@/config/env"
import { validateSession } from "@/utils/session"

export interface AuthUser {
  id: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      sessionToken?: string
    }
  }
}

export function getSessionToken(req: Request): string | undefined {
  const cookieName = env.SESSION_COOKIE_NAME
  const cookie = req.cookies?.[cookieName]
  if (cookie) return cookie
  const header = req.headers.authorization
  if (header?.startsWith("Bearer ")) return header.slice(7)
  return undefined
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getSessionToken(req)
    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required")
    }
    const session = await validateSession(token)
    if (!session) {
      throw new AppError(401, "UNAUTHORIZED", "Session expired or invalid")
    }
    req.user = {
      id: session.userId,
      email: session.email,
      role: session.role,
    }
    req.sessionToken = token
    next()
  } catch (err) {
    next(err)
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getSessionToken(req)
    if (token) {
      const session = await validateSession(token)
      if (session) {
        req.user = { id: session.userId, email: session.email, role: session.role }
        req.sessionToken = token
      }
    }
    next()
  } catch {
    next()
  }
}