"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, Landmark, Lock, Smartphone, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore, formatPrice } from "@/components/store/store-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { createCheckout, createPayment, verifyPayment } from "@/lib/services/account"
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/payments"
import { getErrorMessage } from "@/lib/api"
import { cn } from "@/lib/utils"

type PaymentMethod = "card" | "upi" | "netbanking" | "cod"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartSubtotal, clearCart, toast } = useStore()
  const { isAuthenticated } = useAuth()
  const [method, setMethod] = useState<PaymentMethod>("card")
  const [placing, setPlacing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [promoInput, setPromoInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const discount = appliedPromo === "RR10" ? Math.round(cartSubtotal * 0.1) : 0
  const discounted = cartSubtotal - discount
  const shipping = discounted > 0 && discounted < 10000 ? 199 : 0
  const tax = Math.round(discounted * 0.18)
  const total = discounted + shipping + tax

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (placing) return
    setCheckoutError(null)

    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)

    const shippingAddress = {
      label: "Shipping",
      fullName: String(fd.get("name") ?? "").trim(),
      line1: String(fd.get("address") ?? "").trim(),
      line2: String(fd.get("company") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      state: String(fd.get("state") ?? "").trim(),
      postalCode: String(fd.get("postal") ?? "").trim(),
      country: String(fd.get("country") ?? "India").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
    }

    // Address validation (JS, not just html required)
    const missing: string[] = []
    if (!shippingAddress.fullName) missing.push("Full name")
    if (!shippingAddress.line1) missing.push("Address")
    if (!shippingAddress.city) missing.push("City")
    if (!shippingAddress.state) missing.push("State")
    if (!shippingAddress.postalCode) missing.push("Postal code")
    if (!shippingAddress.country) missing.push("Country")
    if (!shippingAddress.phone) missing.push("Phone")
    else if (shippingAddress.phone.replace(/\D/g, "").length < 10) missing.push("Phone (at least 10 digits)")
    if (missing.length) {
      setCheckoutError(`Please fill in: ${missing.join(", ")}`)
      return
    }
    if (shippingAddress.postalCode.length < 4) {
      setCheckoutError("Please enter a valid postal code")
      return
    }

    if (!isAuthenticated) {
      setCheckoutError("Please sign in to checkout")
      router.push("/login?redirect=/shop/checkout")
      return
    }

    try {
      setPlacing(true)
      const order = await createCheckout({ shippingAddress, couponCode: appliedPromo ?? undefined })
      if (method === "cod") {
        clearCart()
        toast("Order placed successfully (COD)")
        router.push(`/shop/checkout/success?order=${order.id}`)
        return
      }
      const payment = await createPayment(order.id, { provider: "razorpay" })
      if ("razorpay" in payment) {
        let loaded = false
        try {
          loaded = await loadRazorpayScript()
        } catch {
          loaded = false
        }
        if (!loaded) {
          toast("Payment unavailable — please try again later", "error")
          throw new Error("Payment provider unavailable")
        }
        const rzp = payment.razorpay
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await openRazorpayCheckout({
          key: rzp.keyId,
          amount: rzp.amountInPaise,
          currency: rzp.currency,
          order_id: rzp.orderId,
          name: "RR GROUP Store",
          description: `Order ${order.orderNumber}`,
          prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
          notes: rzp.notes,
          theme: { color: "#000000" },
        })
        await verifyPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature })
        clearCart()
        toast("Payment successful — order placed")
        router.push(`/shop/checkout/success?order=${order.id}`)
        return
      }
      throw new Error("Payment provider unavailable")
    } catch (err) {
      const msg = getErrorMessage(err === "Checkout closed" ? null : err)
      if (err instanceof Error && err.message === "Payment provider unavailable") {
        setCheckoutError(msg || "Payment unavailable — please try again later")
      } else {
        setCheckoutError(msg)
      }
      setPlacing(false)
      return
    }
  }

  if (cart.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
        <Link href="/shop/products" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          Browse products
        </Link>
      </div>
    )
  }

  const paymentMethods = [
    { id: "card" as const, label: "Card", icon: CreditCard },
    { id: "upi" as const, label: "UPI", icon: Smartphone },
    { id: "netbanking" as const, label: "Net Banking", icon: Landmark },
    { id: "cod" as const, label: "Cash on Delivery", icon: Truck },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Checkout</h1>

      {checkoutError && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {checkoutError}
        </div>
      )}

      {isAuthenticated ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Signed in — checkout creates a real order with secure Razorpay payment.
        </p>
      ) : (
        <p className="mt-2 text-xs text-destructive">
          Please <Link href="/login?redirect=/shop/checkout" className="font-semibold underline">sign in</Link> to checkout — guest orders are disabled.
        </p>
      )}

      <form onSubmit={(e) => void placeOrder(e)} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Contact */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Contact information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Vikram Sethi" required />
              <Field label="Email" name="email" type="email" placeholder="you@company.com" required />
              <Field label="Phone" name="phone" placeholder="+91 98200 12345" required />
              <Field label="Company (optional)" name="company" placeholder="RR Group Pvt Ltd" />
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Address line" name="address" placeholder="402, Orchid Towers, Bandra West" required />
              </div>
              <Field label="City" name="city" placeholder="Mumbai" required />
              <Field label="State" name="state" placeholder="Maharashtra" required />
              <Field label="Postal code" name="postal" placeholder="400050" required />
              <Field label="Country" name="country" placeholder="India" defaultValue="India" required />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Payment method</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setMethod(pm.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                    method === pm.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  <pm.icon className="size-5" />
                  {pm.label}
                </button>
              ))}
            </div>

            {method === "card" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Card number" name="card" placeholder="4242 4242 4242 4242" />
                </div>
                <Field label="Expiry" name="expiry" placeholder="MM / YY" />
                <Field label="CVC" name="cvc" placeholder="123" />
              </div>
            )}
            {method === "upi" && (
              <div className="mt-5">
                <Field label="UPI ID" name="upi" placeholder="yourname@okhdfc" />
              </div>
            )}
            {method === "netbanking" && (
              <p className="mt-5 text-sm text-muted-foreground">
                You&apos;ll be redirected to your bank&apos;s secure portal to complete payment.
              </p>
            )}
            {method === "cod" && (
              <p className="mt-5 text-sm text-muted-foreground">
                Pay in cash when your order is delivered. A convenience fee may apply.
              </p>
            )}
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Your order</h2>
            <ul className="mt-4 space-y-3">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-accent/40">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="56px" className="object-contain p-1.5" />
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{item.name}</p>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex gap-2">
              <Input
                placeholder="Promo code (RR10)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="h-9"
                aria-label="Promo code"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0"
                onClick={() => {
                  if (promoInput.trim().toUpperCase() === "RR10") setAppliedPromo("RR10")
                  else setAppliedPromo(null)
                }}
              >
                Apply
              </Button>
            </div>
            {appliedPromo && (
              <p className="mt-2 text-xs font-medium text-success">Code {appliedPromo} applied — 10% off</p>
            )}

            <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{formatPrice(cartSubtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="font-medium text-success">−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax (GST 18%)</dt>
                <dd className="font-medium text-foreground">{formatPrice(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5">
                <dt className="font-display text-base font-bold text-foreground">Total</dt>
                <dd className="font-display text-base font-bold text-foreground">{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button type="submit" size="lg" className="mt-6 h-11 w-full" disabled={placing || !isAuthenticated}>
              {placing ? (
                "Placing order…"
              ) : (
                <>
                  <Lock className="size-4" />
                  Place order · {formatPrice(total)}
                </>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="size-3" /> Your payment information is encrypted
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <Input name={name} {...props} />
    </label>
  )
}
