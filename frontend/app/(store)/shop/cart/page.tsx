"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore, formatPrice } from "@/components/store/store-provider"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useStore()
  const [promo, setPromo] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const discount = appliedPromo === "RR10" ? Math.round(cartSubtotal * 0.1) : 0
  const discounted = cartSubtotal - discount
  const shipping = discounted > 0 && discounted < 10000 ? 199 : 0
  const tax = Math.round(discounted * 0.18)
  const total = discounted + shipping + tax

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "RR10") setAppliedPromo("RR10")
    else setAppliedPromo(null)
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven&apos;t added anything yet. Explore our best sellers to get started.
        </p>
        <Link href="/shop/products" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-11 px-6")}>
          Start shopping
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Your cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{cart.length} items in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.variant ?? ""}`}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <Link
                href={`/shop/products/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-accent/40"
              >
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="96px" className="object-contain p-2" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/shop/products/${item.slug}`}
                      className="line-clamp-1 font-semibold text-foreground hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.variant}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.variant)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                      className="flex size-8 items-center justify-center rounded-l-lg hover:bg-accent disabled:opacity-40"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                      className="flex size-8 items-center justify-center rounded-r-lg hover:bg-accent"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    {item.originalPrice > item.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/shop/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowRight className="size-4 rotate-180" />
            Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Order summary</h2>

            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code (try RR10)"
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={applyPromo}>
                Apply
              </Button>
            </div>
            {appliedPromo && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
                <Tag className="size-3.5" /> Code {appliedPromo} applied — 10% off
                <button onClick={() => setAppliedPromo(null)} aria-label="Remove promo">
                  <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </p>
            )}

            <dl className="mt-6 space-y-3 text-sm">
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
                <dd className="font-medium text-foreground">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax (GST 18%)</dt>
                <dd className="font-medium text-foreground">{formatPrice(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="font-display text-base font-bold text-foreground">Total</dt>
                <dd className="font-display text-base font-bold text-foreground">{formatPrice(total)}</dd>
              </div>
            </dl>

            <Link
              href="/shop/checkout"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 w-full")}
            >
              Proceed to checkout
              <ArrowRight className="size-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure 256-bit encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
