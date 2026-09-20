import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { env } from "@/config/env"
import { apiRateLimiter } from "@/middlewares/rate-limit"
import { errorHandler, notFound } from "@/middlewares/error"
import authRoutes from "@/routes/auth.routes"
import catalogRoutes from "@/routes/catalog.routes"
import ecommerceRoutes from "@/routes/ecommerce.routes"
import adminRoutes from "@/routes/admin.routes"
import webhookRoutes from "@/routes/webhook.routes"
import customerRoutes from "@/routes/customer.routes"
import chatbotRoutes from "@/routes/chatbot.routes"
import publicRoutes from "@/routes/public.routes"

export function createApp() {
  const app = express()

  app.set("trust proxy", 1)

  app.use(helmet())
  app.use(
    cors({
      origin: env.FRONTEND_URL.split(",").map((s) => s.trim()),
      credentials: true,
    }),
  )
  app.use("/api/webhooks", express.raw({ type: "*/*" }))
  app.use(express.json({ limit: "2mb" }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  app.get("/", (_req, res) => {
    res.json({
      name: "RR GROUP API",
      version: "1.0.0",
      tagline: "Building Digital Solutions That Drive Business Growth",
      status: "running",
      docs: `${env.BACKEND_URL}/api-docs`,
    })
  })

  app.use("/api", apiRateLimiter)
  app.use("/api/public", publicRoutes)
  app.use("/api/auth", authRoutes)
  app.use("/api/catalog", catalogRoutes)
  app.use("/api/account", customerRoutes)
  app.use("/api", ecommerceRoutes)
  app.use("/api/admin", adminRoutes)
  app.use("/api/chat", chatbotRoutes)
  app.use("/api/webhooks", webhookRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}