import { Router } from "express"
import {
  registerHandler,
  loginHandler,
  firebaseLoginHandler,
  logoutHandler,
  meHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "@/controllers/auth.controller"
import { requireAuth } from "@/middlewares/auth"
import { authRateLimiter } from "@/middlewares/rate-limit"

const router = Router()

router.post("/register", authRateLimiter, registerHandler)
router.post("/login", authRateLimiter, loginHandler)
router.post("/firebase-login", authRateLimiter, firebaseLoginHandler)
router.post("/logout", requireAuth, logoutHandler)
router.get("/me", requireAuth, meHandler)
router.post("/forgot-password", authRateLimiter, forgotPasswordHandler)
router.post("/reset-password", authRateLimiter, resetPasswordHandler)

export default router