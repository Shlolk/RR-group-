"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { createAdminRefund, fetchAdminOrder, updateAdminOrderStatus } from "@/lib/services/admin"
import type { ApiOrder } from "@/lib/api-types"
import { cn } from "@/lib/utils"

const num = (v: string | number) => Number(v)

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [refundAmount, setRefundAmount] = useState<number>(0)

  const load = async () => {
    setLoading(true)
    try {
      const o = await fetchAdminOrder(id)
      setOrder(o)
      setRefundAmount(num(o.total))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const advance = async (next: string) => {
    setBusy(true)
    setError(null)
    try {
      const updated = await updateAdminOrderStatus(id, next)
      setOrder(updated)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const refund = async () => {
    if (!refundAmount || refundAmount <= 0) return
    if (!window.confirm(`Initiate refund of ${formatPrice(refundAmount)}?`)) return
    setBusy(true)
    setError(null)
    try {
      await createAdminRefund(id, { amount: refundAmount })
      window.alert("Refund initiated.")
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (!order) return <p className="text-sm text-destructive">{error ?? "Order not found"}</p>

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          ← Back
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {new Date(order.createdAt).toLocaleString()} by {order.user?.email ?? order.customer?.email ?? "customer"}
            </p>
          </div>
          <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
            {order.paymentStatus}
          </Badge>
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
                <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover" />
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
          <div className="flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span>{formatPrice(num(order.total))}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Status controls</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["confirmed", "processing", "shipped", "out-for-delivery", "delivered", "cancelled"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === "cancelled" ? "destructive" : s === "delivered" ? "default" : "outline"}
                disabled={s === order.status || busy}
                onClick={() => advance(s)}
              >
                {s === order.status ? `✓ ${s}` : s}
              </Button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Refund</h2>
          {order.paymentStatus === "paid" ? (
            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Amount (INR)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>
              <Button onClick={refund} disabled={busy || refundAmount <= 0}>
                Refund
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Only paid orders can be refunded. Current payment status: {order.paymentStatus}.</p>
          )}
        </section>
      </div>

      {(order.payments ?? []).length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Payments</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {(order.payments ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {p.provider} · {p.method} · {p.providerPaymentId ?? p.providerOrderId ?? "—"}
                </span>
                <span className="font-medium">{formatPrice(num(p.amount))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}