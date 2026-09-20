"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { fetchOrders } from "@/lib/services/account"
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchOrders()
      .then((res) => mounted && setOrders(res.items ?? []))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage your orders.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop/products" className={buttonVariants({ className: "mt-4" })}>
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Placed {new Date(order.createdAt).toLocaleString()} · {(order.items ?? []).length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{formatPrice(Number(order.total))}</span>
                  <Badge variant={statusVariant[order.status] ?? "outline"}>{order.status}</Badge>
                </div>
              </div>
              {(order.items ?? []).length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  {(order.items ?? []).slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="size-10 rounded-md object-cover" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {item.name} ×{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}