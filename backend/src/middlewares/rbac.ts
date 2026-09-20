import type { NextFunction, Request, Response } from "express"
import { AppError } from "@/utils/api"
import { findById } from "@/services/db/firestore"

const ROLE_PRIORITY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  STAFF: 40,
  CUSTOMER: 10,
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"))
    }
    if (!roles.includes(role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"))
    }
    next()
  }
}

export function requirePermission(...permissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return next(new AppError(401, "UNAUTHORIZED", "Authentication required"))
      }

      const user = await findById<{ id: string; role: string; permissions: string[] }>("users", userId)
      if (!user) {
        return next(new AppError(401, "UNAUTHORIZED", "User not found"))
      }

      const priority = ROLE_PRIORITY[user.role] ?? 0
      if (priority >= 80) {
        return next()
      }

      const allowed = permissions.every((p) => user.permissions.includes(p as never))
      if (!allowed) {
        return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"))
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function requireStaff() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role) return next(new AppError(401, "UNAUTHORIZED", "Authentication required"))
    const priority = ROLE_PRIORITY[role] ?? 0
    if (priority < 30) {
      return next(new AppError(403, "FORBIDDEN", "Staff access required"))
    }
    next()
  }
}