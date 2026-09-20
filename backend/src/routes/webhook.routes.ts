import { Router } from "express"
import { createHmac } from "crypto"
import { env } from "@/config/env"
import { getStripe } from "@/config/payment"
import * as paymentService from "@/services/payment/payment.service"

const router = Router()

router.post("/razorpay", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string
    const secret = env.RAZORPAY_WEBHOOK_SECRET

    if (!secret) {
      return res.status(500).json({ success: false, message: "Webhook secret not configured" })
    }

    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body)
    const expected = createHmac("sha256", secret).update(raw).digest("hex")
    if (expected !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" })
    }

    const body = Buffer.isBuffer(req.body) ? JSON.parse(raw) : req.body
    const event = body.event as string
    await paymentService.handleRazorpayWebhook(event, body.payload)

    return res.json({ received: true })
  } catch (err) {
    console.error("Razorpay webhook error:", err)
    return res.status(500).json({ success: false, message: "Webhook processing failed" })
  }
})

router.post("/stripe", async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"] as string
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ success: false, message: "Webhook secret not configured" })
    }
    const stripe = getStripe()
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body)
    const event = stripe.webhooks.constructEvent(raw, signature, env.STRIPE_WEBHOOK_SECRET)

    await paymentService.handleStripeWebhook(
      event.type as "payment_intent.succeeded" | "payment_intent.payment_failed",
      event as unknown as { data?: { object?: Record<string, unknown> } },
    )

    return res.json({ received: true })
  } catch (err) {
    console.error("Stripe webhook error:", err)
    return res.status(400).json({ success: false, message: "Webhook processing failed" })
  }
})

export default router