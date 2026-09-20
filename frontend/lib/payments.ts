// Razorpay checkout integration helpers.

export interface RazorpayCheckoutPayload {
  key: string
  amount: number // in paise
  currency: string
  order_id: string
  name: string
  description?: string
}

interface RazorpayOptions extends RazorpayCheckoutPayload {
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  modal?: {
    ondismiss?: () => void
  }
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void
    }
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay unavailable on server"))
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("razorpay-checkout-sdk")
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.Razorpay) resolve(true)
        else reject(new Error("Failed to load Razorpay SDK"))
      })
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")))
      return
    }
    const script = document.createElement("script")
    script.id = "razorpay-checkout-sdk"
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.addEventListener("load", () => {
      if (window.Razorpay) resolve(true)
      else reject(new Error("Failed to load Razorpay SDK"))
    })
    script.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")))
    document.head.appendChild(script)
  })
}

export function openRazorpayCheckout(
  payload: RazorpayCheckoutPayload & {
    prefill?: RazorpayOptions["prefill"]
    notes?: RazorpayOptions["notes"]
    theme?: RazorpayOptions["theme"]
  },
): Promise<{
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"))
      return
    }
    let settled = false
    const rzp = new window.Razorpay({
      ...payload,
      handler: (response) => {
        if (settled) return
        settled = true
        resolve(response)
      },
      modal: {
        ondismiss: () => {
          if (settled) return
          settled = true
          reject(new Error("Checkout closed"))
        },
      },
    })
    rzp.open()
  })
}