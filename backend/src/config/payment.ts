import { env } from "./env"
import Razorpay from "razorpay"
import Stripe from "stripe"

export const paymentConfig = {
  razorpayEnabled: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
  stripeEnabled: Boolean(env.STRIPE_SECRET_KEY),
}

let razorpayInstance: Razorpay | null = null
let stripeInstance: Stripe | null = null

export function getRazorpay(): Razorpay {
  if (!paymentConfig.razorpayEnabled) {
    throw new Error("Razorpay credentials not configured")
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!,
    })
  }
  return razorpayInstance
}

export function getStripe(): Stripe {
  if (!paymentConfig.stripeEnabled) {
    throw new Error("Stripe credentials not configured")
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    })
  }
  return stripeInstance
}