"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { fetchAdminOrders, updateAdminOrderStatus } from "@/lib/services/admin"
import type { ApiOrder } from "@/lib/api-types"

const statusVariant: Record<string, "warning" | "accent" | "success" | "destructive" | "outline"> = {
  placed: "warning",
  confirmed: "warning",
  processing: "accent",
  shipped: "accent",
  "out-for-delivery": "accent",
  delivered: "success",
  cancelled: "destructive",
}

const nextStatuses: Record<string, string> = {
  placed: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "out-for-delivery",
  "out-for-delivery": "delivered",
}

const num = (v: string | number) => Number(v)

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchAdminOrders({ page, perPage: 20, status: status || undefined })
      .then((res) => {
        if (!mounted) return
        const items = Array.isArray(res) ? res : (res as unknown as { items: ApiOrder[]; total: number }).items ?? []
        const totalCount = Array.isArray(res) ? items.length : ((res as unknown as { items: ApiOrder[]; total: number }).total ?? items.length)
        setOrders(items)
        setTotal(totalCount)
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [page, status])

  const advance = async (order: ApiOrder) => {
    const next = nextStatuses[order.status]
    if (!next) return
    setBusyId(order.id)
    setError(null)
    try {
      const updated = await updateAdminOrderStatus(order.id, next)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const cancel = async (order: ApiOrder) => {
    if (order.status === "cancelled") return
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return
    setBusyId(order.id)
    setError(null)
    try {
      const updated = await updateAdminOrderStatus(order.id, "cancelled")
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const perPage = 20
  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} orders</p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out-for-delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-primary">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[order.status] ?? "outline"}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(num(order.total))}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {nextStatuses[order.status] && (
                        <Button size="sm" onClick={() => advance(order)} disabled={busyId === order.id}>
                          Advance
                        </Button>
                      )}
                      {(order.status === "placed" || order.status === "confirmed") && (
                        <Button size="sm" variant="destructive" onClick={() => cancel(order)} disabled={busyId === order.id}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}