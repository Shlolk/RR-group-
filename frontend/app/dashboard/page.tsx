"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { fetchMyTickets, fetchOrders } from "@/lib/services/account"
import { getErrorMessage } from "@/lib/api"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/components/store/store-provider"
import type { ApiOrder, ApiTicket } from "@/lib/api-types"
import { Package, ShieldCheck, Ticket, Truck } from "lucide-react"

const statusVariant: Record<string, "warning" | "accent" | "success" | "destructive" | "outline"> = {
  placed: "warning",
  confirmed: "warning",
  processing: "accent",
  shipped: "accent",
  "out-for-delivery": "accent",
  delivered: "success",
  cancelled: "destructive",
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchOrders(), fetchMyTickets()])
      .then(([o, t]) => {
        if (!mounted) return
        const tickets = Array.isArray(t) ? t : (t as unknown as { items?: ApiTicket[] }).items ?? []
        setOrders(o.items ?? [])
        setTickets(tickets)
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoadingOrders(false))
    return () => {
      mounted = false
    }
  }, [])

  const stat = (label: string, value: string, icon: React.ReactNode) => (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome, {user?.firstName ?? "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat("Orders", String((orders ?? []).length), <Package className="size-4" />)}
        {stat(
          "In Progress",
          String((orders ?? []).filter((o) => !["delivered", "cancelled"].includes(o.status)).length),
          <Truck className="size-4" />,
        )}
        {stat(
          "Support Tickets",
          String((tickets ?? []).length),
          <Ticket className="size-4" />,
        )}
        {stat("Account", "Verified", <ShieldCheck className="size-4" />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {loadingOrders ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
          ) : (orders ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">No orders yet.</p>
              <Link href="/shop/products" className={buttonVariants({ size: "sm" })}>
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(orders ?? []).slice(0, 4).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                  <Badge variant={statusVariant[order.status] ?? "outline"}>
                    {order.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Recent tickets</h2>
            <Link href="/dashboard/support" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {(tickets ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">No support tickets.</p>
              <Link
                href="/dashboard/support"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
              >
                Open a ticket
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(tickets ?? []).slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.status} · {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}