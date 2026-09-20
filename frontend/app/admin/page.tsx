"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import {
  fetchDashboard,
  fetchInquiries,
  fetchLeads,
  fetchAdminTickets,
  fetchAdminOrders,
} from "@/lib/services/admin"
import { api } from "@/lib/api"
import type { ApiDashboardStats } from "@/lib/api-types"
import { cn } from "@/lib/utils"

const num = (v?: string | number | null) => Number(v ?? 0)

type RecentItem = { id: string; title?: string; name?: string; email?: string; subject?: string; status?: string; createdAt?: string; orderNumber?: string }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<RecentItem[]>([])
  const [recentApplications, setRecentApplications] = useState<RecentItem[]>([])
  const [recentLeads, setRecentLeads] = useState<RecentItem[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentItem[]>([])
  const [recentTickets, setRecentTickets] = useState<RecentItem[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const d = await fetchDashboard()
        if (mounted) setStats(d)
      } catch (err) {
        if (mounted) setError(getErrorMessage(err))
      } finally {
        if (mounted) setLoading(false)
      }
      // Recent tracks — best effort, ignore failures
      try {
        const [inq, leads, tickets, orders] = await Promise.all([
          fetchInquiries().catch(() => [] as unknown[]),
          fetchLeads({ perPage: 5 }).catch(() => ({ items: [] }) as unknown as { items: unknown[] }),
          fetchAdminTickets({}).catch(() => ({ items: [] }) as unknown as { items: unknown[] }),
          fetchAdminOrders({ perPage: 5 }).catch(() => ({ items: [] }) as unknown as { items: unknown[] }),
        ])
        if (!mounted) return
        const inqArr = Array.isArray(inq) ? (inq as RecentItem[]) : ((inq as { items?: RecentItem[] })?.items ?? [])
        setRecentInquiries(inqArr.slice(0, 5))
        const leadsArr = Array.isArray(leads) ? (leads as RecentItem[]) : ((leads as { items?: RecentItem[] })?.items ?? [])
        setRecentLeads(leadsArr.slice(0, 5))
        const ticketsArr = Array.isArray(tickets) ? (tickets as RecentItem[]) : ((tickets as { items?: RecentItem[] })?.items ?? [])
        setRecentTickets(ticketsArr.slice(0, 5))
        const ordersArr = Array.isArray(orders) ? (orders as RecentItem[]) : ((orders as { items?: RecentItem[] })?.items ?? [])
        setRecentOrders(ordersArr.slice(0, 5))
      } catch {
        // ignore
      }
      try {
        const apps = await api.get<unknown>("/api/admin/applications").catch(() => ({ items: [] }) as unknown)
        if (!mounted) return
        const appsArr = Array.isArray(apps) ? (apps as RecentItem[]) : ((apps as { items?: RecentItem[] })?.items ?? [])
        setRecentApplications(appsArr.slice(0, 5))
      } catch {
        // ignore
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard…</p>
  }

  if (error && !stats) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </div>
    )
  }

  const card = (label: string, value: string, href?: string) => (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {href && (
        <Link href={href} className={cn(buttonVariants({ variant: "link", size: "xs" }), "mt-1 px-0")}>
          View →
        </Link>
      )}
    </div>
  )

  const totals = stats?.totals ?? {}
  const revenue = stats?.revenue ?? totals?.revenue ?? num(totals?.revenue)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Business overview at a glance.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {card("Revenue", formatPrice(revenue), "/admin/orders")}
        {card("Orders", String(stats?.ordersCount ?? totals?.orders ?? 0), "/admin/orders")}
        {card("Customers", String(stats?.customerCount ?? totals?.customers ?? 0), "/admin/users")}
        {card("Products", String(stats?.productCount ?? totals?.products ?? 0), "/admin/products")}
        {card("Pending Orders", String(stats?.pendingOrders ?? 0), "/admin/orders")}
        {card("Low Stock", String(stats?.lowStockCount ?? 0), "/admin/products")}
        {card("Open Tickets", String(stats?.openTickets ?? 0), "/admin/support")}
        {card("Unread Messages", String(stats?.unreadMessages ?? 0), "/admin/support")}
      </div>

      {/* Live activity — all tracks at a glance */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Recent Orders", items: recentOrders, href: "/admin/orders", empty: "No orders yet", getLabel: (r: RecentItem) => r.orderNumber ?? r.id, getSub: (r: RecentItem) => r.status ?? "" },
          { title: "Recent Queries", items: recentInquiries, href: "/admin/inquiries", empty: "No queries yet", getLabel: (r: RecentItem) => r.subject ?? r.name ?? r.email ?? r.id, getSub: (r: RecentItem) => r.status ?? r.email ?? "" },
          { title: "Recent Applications", items: recentApplications, href: "/admin/applications", empty: "No applications yet", getLabel: (r: RecentItem) => (r as unknown as { fullName?: string }).fullName ?? r.name ?? r.email ?? r.id, getSub: (r: RecentItem) => (r as unknown as { position?: string }).position ?? r.status ?? "" },
          { title: "Recent Leads", items: recentLeads, href: "/admin/leads", empty: "No leads yet", getLabel: (r: RecentItem) => r.name ?? r.email ?? r.id, getSub: (r: RecentItem) => r.status ?? "" },
          { title: "Recent Tickets", items: recentTickets, href: "/admin/support", empty: "No tickets yet", getLabel: (r: RecentItem) => r.subject ?? r.title ?? r.id, getSub: (r: RecentItem) => r.status ?? "" },
        ].map((sec) => (
          <section key={sec.title} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{sec.title}</h2>
              <Link href={sec.href} className={cn(buttonVariants({ variant: "ghost", size: "xs" }), "h-7 px-2 text-xs")}>
                View all →
              </Link>
            </div>
            {sec.items.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">{sec.empty}</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {sec.items.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="truncate text-xs font-medium text-foreground">{sec.getLabel(r)}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{sec.getSub(r)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {stats?.paymentMethodStats && stats.paymentMethodStats.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Payments by method</h2>
          <div className="mt-3 space-y-2">
            {stats.paymentMethodStats.map((p) => (
              <div key={p.method} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {p.method} · {p.count}
                </span>
                <span className="font-medium">{formatPrice(p.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats?.topProducts && stats.topProducts.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Top products</h2>
          <ul className="mt-3 space-y-2">
            {stats.topProducts.map((t) => (
              <li key={t.productId} className="flex items-center justify-between text-sm">
                <span className="truncate text-muted-foreground">{t.name}</span>
                <span className="ml-4 shrink-0">
                  {t.quantity} sold · <span className="font-medium">{formatPrice(t.revenue)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Quick actions</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Manage orders
            </Link>
            <Link href="/admin/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Manage products
            </Link>
            <Link href="/admin/leads" className={buttonVariants({ variant: "outline", size: "sm" })}>
              CRM leads
            </Link>
            <Link href="/admin/support" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Support tickets
            </Link>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Flags</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending reviews</span>
              <span className="font-medium">{stats?.pendingReviewCount ?? 0}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">New inquiries</span>
              <span className="font-medium">{stats?.newInquiryCount ?? 0}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}