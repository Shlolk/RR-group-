import { env } from "@/config/env"
import rateLimit from "express-rate-limit"
import type { Request } from "express"

export function createRateLimiter(
  windowMs = env.RATE_LIMIT_WINDOW_MS,
  max = env.RATE_LIMIT_MAX,
) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res) => {
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
        code: "RATE_LIMITED",
      })
    },
  })
}

export const apiRateLimiter = createRateLimiter()

export const authRateLimiter = createRateLimiter(60_000, 20)

export const chatLimiter = createRateLimiter(60_000, 60)