import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  BACKEND_URL: z.string().default("http://localhost:5000"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/rr_group?schema=public"),

  JWT_SECRET: z.string().default("dev-secret-change-me"),
  SESSION_COOKIE_NAME: z.string().default("rr_session"),
  ACCESS_TOKEN_MAX_AGE: z.coerce.number().default(86400),
  RESET_PASSWORD_TOKEN_MAX_AGE: z.coerce.number().default(3600),

  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PUBLIC_KEY: z.string().optional().default(""),

  AI_PROVIDER: z.string().default("openai"),
  AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_BASE_URL: z.string().optional().default(""),

  EMAIL_PROVIDER: z.string().default("resend"),
  EMAIL_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("RR GROUP <no-reply@rrgroup.example>"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  LOG_LEVEL: z.string().default("info"),

  ADMIN_SECRET: z.string().default("rrgroup-admin-2024"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data