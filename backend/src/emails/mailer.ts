import { env } from "@/config/env"
import nodemailer from "nodemailer"

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
  try {
    if (env.EMAIL_PROVIDER === "resend" && env.EMAIL_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        return { success: false, error: body }
      }
      return { success: true }
    }

    if (env.EMAIL_PROVIDER === "smtp" && env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
      })
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      })
      return { success: true }
    }

    return { success: true }
  } catch (err) {
    console.error("Email send failed:", err)
    return { success: false, error: (err as Error).message }
  }
}