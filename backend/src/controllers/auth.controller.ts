import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import * as authService from "@/services/auth/auth.service"
import {
  loginSchema,
  registerSchema,
  firebaseLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validators/auth"
import { env } from "@/config/env"
import { loginAudit, logoutAudit } from "@/utils/audit"

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.ACCESS_TOKEN_MAX_AGE * 1000,
  path: "/",
}

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body)
    const user = await authService.register(input)
    return success(res, user, "Account created successfully", 201)
  } catch (err) {
    next(err)
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body)
    const ip = req.ip || (req.socket?.remoteAddress ?? undefined)
    const { user, token } = await authService.login(input, req.headers["user-agent"], ip)
    res.cookie(env.SESSION_COOKIE_NAME, token, cookieOptions)
    loginAudit(user.id, ip)
    return success(res, user, "Logged in successfully")
  } catch (err) {
    next(err)
  }
}

export async function firebaseLoginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = firebaseLoginSchema.parse(req.body)
    const ip = req.ip || (req.socket?.remoteAddress ?? undefined)
    const { user, token } = await authService.loginWithIdToken(input.idToken, req.headers["user-agent"], ip)
    res.cookie(env.SESSION_COOKIE_NAME, token, cookieOptions)
    loginAudit(user.id, ip)
    return success(res, user, "Logged in successfully")
  } catch (err) {
    next(err)
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.sessionToken
    await authService.logout(token)
    res.clearCookie(env.SESSION_COOKIE_NAME, cookieOptions)
    if (req.user) {
      logoutAudit(req.user.id, req.ip)
    }
    return success(res, null, "Logged out successfully")
  } catch (err) {
    next(err)
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.me(req.user!.id)
    return success(res, user, "Profile fetched")
  } catch (err) {
    next(err)
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = forgotPasswordSchema.parse(req.body)
    await authService.forgotPassword(input.email)
    return success(res, null, "If that email exists, a reset link has been sent")
  } catch (err) {
    next(err)
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = resetPasswordSchema.parse(req.body)
    await authService.resetPassword(input.token, input.password)
    return success(res, null, "Password reset successfully")
  } catch (err) {
    next(err)
  }
}