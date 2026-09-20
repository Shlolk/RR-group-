import { env } from "@/config/env"
import { sendEmail } from "./mailer"

function wrap(title: string, body: string): string {
  return `
  <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
      <div style="width: 32px; height: 32px; border-radius: 8px; background: #1d4ed8; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">RR</div>
      <span style="font-weight: 700; font-size: 16px; color: #111;">RR GROUP</span>
    </div>
    <h1 style="font-size: 20px; color: #111; margin: 0 0 12px;">${title}</h1>
    <div style="color: #444; font-size: 14px; line-height: 1.6;">${body}</div>
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} RR GROUP · Building Digital Solutions That Drive Business Growth
    </div>
  </div>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display: inline-block; margin-top: 16px; background: #1d4ed8; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">${label}</a>`
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: "Welcome to RR GROUP",
    html: wrap(
      "Welcome to RR GROUP",
      `<p>Hi ${firstName},</p><p>Thanks for joining RR GROUP. Your account is ready — you can now access our services, shop products, and track orders from your dashboard.</p>${button(env.FRONTEND_URL, "Go to Dashboard")}`,
    ),
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = token.startsWith("http://") || token.startsWith("https://") ? token : `${env.FRONTEND_URL}/reset-password?token=${token}`
  return sendEmail({
    to,
    subject: "Reset your RR GROUP password",
    html: wrap(
      "Reset your password",
      `<p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>${button(link, "Reset password")}`,
    ),
  })
}

export async function sendOrderConfirmationEmail(to: string, orderNumber: string, total: string, items: string[]) {
  const itemsHtml = items.map((i) => `<li>${i}</li>`).join("")
  return sendEmail({
    to,
    subject: `Order ${orderNumber} confirmed`,
    html: wrap(
      `Order ${orderNumber} confirmed`,
      `<p>Thanks for your purchase. Your order for ${total} is confirmed.</p><ul style="padding-left: 18px;">${itemsHtml}</ul>${button(`${env.FRONTEND_URL}/shop/orders/${orderNumber}`, "Track your order")}`,
    ),
  })
}

export async function sendPaymentSuccessEmail(to: string, orderNumber: string, amount: string) {
  return sendEmail({
    to,
    subject: `Payment successful for order ${orderNumber}`,
    html: wrap(
      "Payment received",
      `<p>Your payment of ${amount} for order ${orderNumber} was successful.</p>${button(`${env.FRONTEND_URL}/shop/orders/${orderNumber}`, "View order")}`,
    ),
  })
}

export async function sendPaymentFailedEmail(to: string, orderNumber: string, reason?: string) {
  return sendEmail({
    to,
    subject: `Payment failed for order ${orderNumber}`,
    html: wrap(
      "Payment failed",
      `<p>Your payment for order ${orderNumber} could not be processed${reason ? `: ${reason}` : "."}. You can retry payment from your dashboard.</p>${button(env.FRONTEND_URL, "Go to Dashboard")}`,
    ),
  })
}

export async function sendOrderShippedEmail(to: string, orderNumber: string, trackingNumber?: string) {
  return sendEmail({
    to,
    subject: `Order ${orderNumber} shipped`,
    html: wrap(
      "Your order is on the way",
      `<p>Great news! Your order ${orderNumber} has shipped${trackingNumber ? ` with tracking number ${trackingNumber}` : ""}.</p>${button(`${env.FRONTEND_URL}/shop/orders/${orderNumber}`, "Track order")}`,
    ),
  })
}

export async function sendRefundEmail(to: string, orderNumber: string, amount: string) {
  return sendEmail({
    to,
    subject: `Refund initiated for order ${orderNumber}`,
    html: wrap(
      "Refund initiated",
      `<p>A refund of ${amount} has been initiated for order ${orderNumber}. It may take 5–10 business days to reflect in your account.</p>`,
    ),
  })
}

export async function sendTicketUpdateEmail(to: string, ticketId: string, status: string) {
  return sendEmail({
    to,
    subject: `Support ticket ${ticketId} updated`,
    html: wrap(
      "Support ticket update",
      `<p>Your support ticket ${ticketId} has been updated. Current status: <strong>${status}</strong>.</p>${button(`${env.FRONTEND_URL}/dashboard/support`, "View ticket")}`,
    ),
  })
}

export async function sendInvoiceEmail(to: string, invoiceNumber: string, amount: string) {
  return sendEmail({
    to,
    subject: `Invoice ${invoiceNumber} from RR GROUP`,
    html: wrap(
      `Invoice ${invoiceNumber}`,
      `<p>Your invoice for ${amount} is ready.</p>${button(`${env.FRONTEND_URL}/dashboard/invoices`, "View invoice")}`,
    ),
  })
}