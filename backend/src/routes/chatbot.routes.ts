import { Router } from "express"
import { optionalAuth } from "@/middlewares/auth"
import { chatLimiter } from "@/middlewares/rate-limit"
import { chatHandler } from "@/controllers/chatbot.controller"

const router = Router()

router.post("/chat", optionalAuth, chatLimiter, chatHandler)

export default router