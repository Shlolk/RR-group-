"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { cancelOrder, fetchOrder } from "@/lib/services/account"
import type { ApiOrder } from "@/lib/api-types"
import { cn } from "@/lib/utils"

const statusVariant: Record<string, "warning" | "accent" | "success" | "destructive" | "outline"> = {
  placed: "warning",
  confirmed: "warning",
  processing: "accent",
  shipped: "accent",
  "out-for-delivery": "accent",
  delivered: "success",
  cancelled: "destructive",
}

const num = (v: string | number) => Number(v)

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchOrder(id)
      .then((o) => mounted && setOrder(o))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    setError(null)
    try {
      const updated = await cancelOrder(id)
      setOrder(updated)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading order…</p>
  }

  if (error && !order) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
        <Link href="/dashboard/orders" className={buttonVariants({ variant: "outline" })}>
          Back to orders
        </Link>
      </div>
    )
  }

  if (!order) return null

  const cancellable = ["placed", "confirmed"].includes(order.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[order.status] ?? "outline"}>{order.status}</Badge>
          {cancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Cancel order"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">Items</h2>
        <ul className="divide-y divide-border">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-3">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="size-14 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku && `SKU ${item.sku} · `}
                  Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(num(item.total))}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1.5 border-t border-border px-5 py-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(num(order.subtotal))}</span>
          </div>
          {num(order.discountAmount) > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>-{formatPrice(num(order.discountAmount))}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{num(order.shippingCharge) === 0 ? "Free" : formatPrice(num(order.shippingCharge))}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatPrice(num(order.taxAmount))}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-bold text-foreground">
            <span>Total</span>
            <span>{formatPrice(num(order.total))}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Shipping address</h2>
          {order.shippingAddress ? (
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Not provided</p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Payments</h2>
          {(order.payments ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {(order.payments ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {p.provider} · {p.method}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{formatPrice(num(p.amount))}</span>
                    <Badge variant={p.status === "captured" || p.status === "paid" ? "success" : "warning"}>
                      {p.status}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {(order.statusHistory ?? []).length > 0 && (
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">Timeline</h2>
          <ol className="px-5 py-4">
            {[...(order.statusHistory ?? [])]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((h, i) => (
                <li key={h.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < (order.statusHistory?.length ?? 0) - 1 && (
                    <span className="absolute left-[11px] top-6 h-full w-px bg-border" />
                  )}
                  <span
                    className={cn(
                      "mt-1 size-3 shrink-0 rounded-full border-2",
                      i === (order.statusHistory?.length ?? 0) - 1
                        ? "border-primary bg-primary"
                        : "border-border bg-card",
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium capitalize">{h.status.replace(/-/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                      {h.note ? ` · ${h.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
          </ol>
        </section>
      )}

      <Link href="/dashboard/orders" className={buttonVariants({ variant: "outline" })}>
        Back to orders
      </Link>
    </div>
  )
}