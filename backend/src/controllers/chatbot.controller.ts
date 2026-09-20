import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import { handleChat } from "@/ai/chatbot.service"
import { env } from "@/config/env"

export async function chatHandler(req: Request, res: Response, _next: NextFunction) {
  try {
    if (!env.AI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "AI assistant is not configured. Please set AI_API_KEY in the backend environment.",
        code: "AI_NOT_CONFIGURED",
      })
    }

    const { message, history } = req.body
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Message is required", code: "VALIDATION_ERROR" })
    }

    const ctx = {
      userId: req.user?.id,
      role: req.user?.role,
      isStaff: Boolean(req.user && ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(req.user.role)),
    }

    const result = await handleChat({ message, history }, ctx)
    return success(res, result, "Chat response generated")
  } catch (err) {
    console.error("Chat error:", err)
    return res.status(502).json({
      success: false,
      message: "The AI assistant could not be reached. Please try again.",
      code: "AI_UNAVAILABLE",
    })
  }
}