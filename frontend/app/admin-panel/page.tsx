"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import {
  fetchDashboard,
  fetchInquiries,
  fetchLeads,
  fetchAdminTickets,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchUsers,
  fetchReviews,
} from "@/lib/services/admin"
import { api } from "@/lib/api"
import type { ApiDashboardStats } from "@/lib/api-types"
import { formatPrice } from "@/components/store/store-provider"

type Tab = "overview" | "orders" | "queries" | "applications" | "leads" | "tickets" | "products" | "users" | "content"

const tabs: { id: Tab; label: string; count?: number }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "queries", label: "Queries" },
  { id: "applications", label: "Applications" },
  { id: "leads", label: "Leads" },
  { id: "tickets", label: "Tickets" },
  { id: "products", label: "Products" },
  { id: "users", label: "Users" },
  { id: "content", label: "Content" },
]

export default function AdminPanelPage() {
  const [active, setActive] = useState<Tab>("overview")
  const [stats, setStats] = useState<ApiDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Lists
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])
  const [queries, setQueries] = useState<Record<string, unknown>[]>([])
  const [applications, setApplications] = useState<Record<string, unknown>[]>([])
  const [leads, setLeads] = useState<Record<string, unknown>[]>([])
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([])
  const [products, setProducts] = useState<Record<string, unknown>[]>([])
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const d = await fetchDashboard()
        if (mounted) setStats(d as ApiDashboardStats)
      } catch (e) {
        if (mounted) setError(getErrorMessage(e))
      } finally {
        if (mounted) setLoading(false)
      }
      // Parallel lists — best effort
      const safe = async <T,>(p: Promise<T>, fallback: unknown): Promise<T> => {
        try {
          return await p
        } catch {
          return fallback as T
        }
      }
      const [o, q, l, t, p, u, r] = await Promise.all([
        safe(fetchAdminOrders({ perPage: 10 }), { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } } as unknown as never),
        safe(fetchInquiries(), [] as unknown[]),
        safe(fetchLeads({ perPage: 10 }), { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } } as unknown as never),
        safe(fetchAdminTickets({}), { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } } as unknown as never),
        safe(fetchAdminProducts({ perPage: 10 }), { items: [], total: 0 } as unknown as never),
        safe(fetchUsers({ perPage: 10 }), { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } } as unknown as never),
        safe(fetchReviews(), [] as unknown[]),
      ])
      const apps = await safe(api.get<unknown>("/api/admin/applications").catch(() => ({ items: [] }) as unknown), { items: [] } as unknown)
      if (!mounted) return
      const toArr = (v: unknown): Record<string, unknown>[] => {
        if (Array.isArray(v)) return v as Record<string, unknown>[]
        const o = v as { items?: Record<string, unknown>[] }
        return o?.items ?? []
      }
      setOrders(toArr(o).slice(0, 10))
      setQueries(toArr(q).slice(0, 10))
      setLeads(toArr(l).slice(0, 10))
      setTickets(toArr(t).slice(0, 10))
      setProducts(toArr(p).slice(0, 10))
      setUsers(toArr(u).slice(0, 10))
      setReviews(toArr(r).slice(0, 10))
      setApplications(toArr(apps).slice(0, 10))
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filterList = (list: Record<string, unknown>[]) => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter((r) => JSON.stringify(r).toLowerCase().includes(q))
  }

  const card = (label: string, value: string, sub?: string) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
    </div>
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  const totals = (stats as unknown as { totals?: Record<string, number> })?.totals ?? {}
  const revenue = (stats as unknown as { revenue?: number | { total: number } })?.revenue
  const revTotal = typeof revenue === "number" ? revenue : (revenue as { total?: number })?.total ?? (totals as Record<string, number>).revenue ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Command Center</h1>
          <p className="mt-1 text-sm text-white/60">Separate panel — live tracking of every project, list, update and query. Staff only.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search across all lists…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-white/20"
          />
          <Link href="/admin">
            <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              Classic view
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        {card("Revenue", formatPrice(Number(revTotal)))}
        {card("Orders", String((stats as unknown as { ordersCount?: number })?.ordersCount ?? (totals as Record<string, number>).orders ?? 0))}
        {card("Customers", String((stats as unknown as { customerCount?: number })?.customerCount ?? 0))}
        {card("Products", String((stats as unknown as { productCount?: number })?.productCount ?? 0))}
        {card("Pending", String((stats as unknown as { pendingOrders?: number })?.pendingOrders ?? 0), "Orders")}
        {card("Low Stock", String((stats as unknown as { lowStockCount?: number })?.lowStockCount ?? 0))}
        {card("Open Tickets", String((stats as unknown as { openTickets?: number })?.openTickets ?? 0))}
        {card("Inquiries", String(queries.length), "Queries")}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              active === t.id ? "bg-white text-[#0a0a0f]" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {active === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[
            { title: "Recent Orders", items: orders, href: "/admin/orders", cols: ["orderNumber", "status"] },
            { title: "Recent Queries", items: queries, href: "/admin/inquiries", cols: ["subject", "status"] },
            { title: "Recent Applications", items: applications, href: "/admin/applications", cols: ["position", "status"] },
            { title: "Recent Leads", items: leads, href: "/admin/leads", cols: ["name", "status"] },
            { title: "Recent Tickets", items: tickets, href: "/admin/support", cols: ["subject", "status"] },
            { title: "Recent Reviews", items: reviews, href: "/admin/reviews", cols: ["rating", "status"] },
          ].map((sec) => (
            <section key={sec.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{sec.title}</h3>
                <Link href={sec.href} className="text-xs font-medium text-white/60 hover:text-white">
                  View all →
                </Link>
              </div>
              {sec.items.length === 0 ? (
                <p className="mt-3 text-xs text-white/40">No {sec.title.toLowerCase()} yet</p>
              ) : (
                <ul className="mt-3 divide-y divide-white/10">
                  {filterList(sec.items)
                    .slice(0, 5)
                    .map((r) => (
                      <li key={String(r.id)} className="flex items-center justify-between gap-2 py-2">
                        <span className="truncate text-xs font-medium text-white">
                          {String(r.orderNumber ?? r.subject ?? r.title ?? r.name ?? r.email ?? r.id).slice(0, 40)}
                        </span>
                        <Badge variant="outline" className="shrink-0 border-white/15 bg-white/5 text-[11px] text-white/70">
                          {String(r.status ?? "—")}
                        </Badge>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Orders */}
      {active === "orders" && (
        <Table title="Orders — tracking, status updates, refunds" items={filterList(orders)} href="/admin/orders" cols={["orderNumber", "status", "paymentStatus", "total"]} />
      )}
      {active === "queries" && (
        <Table title="Queries — contact inquiries" items={filterList(queries)} href="/admin/inquiries" cols={["name", "email", "subject", "status"]} />
      )}
      {active === "applications" && (
        <Table title="Applications — career submissions" items={filterList(applications)} href="/admin/applications" cols={["fullName", "email", "position", "status"]} />
      )}
      {active === "leads" && <Table title="Leads — CRM pipeline" items={filterList(leads)} href="/admin/leads" cols={["name", "email", "status", "value"]} />}
      {active === "tickets" && <Table title="Tickets — support" items={filterList(tickets)} href="/admin/support" cols={["subject", "status", "priority"]} />}
      {active === "products" && <Table title="Products — inventory" items={filterList(products)} href="/admin/products" cols={["name", "slug", "stock", "price"]} />}
      {active === "users" && <Table title="Users — accounts & roles" items={filterList(users)} href="/admin/users" cols={["email", "role", "isActive"]} />}
      {active === "content" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <MiniLink href="/admin/blog" label="Blog" desc="Posts, publishing" />
          <MiniLink href="/admin/faqs" label="FAQs" desc="Help center" />
          <MiniLink href="/admin/testimonials" label="Testimonials" desc="Social proof" />
          <MiniLink href="/admin/portfolio" label="Portfolio" desc="Case studies" />
          <MiniLink href="/admin/services" label="Services" desc="Offerings" />
          <MiniLink href="/admin/jobs" label="Jobs" desc="Open roles" />
        </div>
      )}
    </div>
  )
}

function Table({
  title,
  items,
  href,
  cols,
}: {
  title: string
  items: Record<string, unknown>[]
  href: string
  cols: string[]
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <Link href={href} className="text-xs font-medium text-white/60 hover:text-white">
          Manage →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-white/40">No items yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-left text-xs">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-widest text-white/40">
              <tr>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-2 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((r) => (
                <tr key={String(r.id)} className="text-white/80">
                  {cols.map((c) => (
                    <td key={c} className="max-w-[200px] truncate px-3 py-2">
                      {String(r[c] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function MiniLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.08]">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 text-xs text-white/50">{desc}</p>
      <p className="mt-3 text-xs font-medium text-white/70">Open →</p>
    </Link>
  )
}
