import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import { COLLECTIONS, countWhere, findById, findMany, getDb } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }
type OrderItemRow = { productId?: string; quantity?: unknown; total?: unknown; name?: string }
type StatusGroup = { status: string | null; _count: { _all: number } }

function orderItems(order: Row): OrderItemRow[] {
  return Array.isArray(order.items) ? (order.items as OrderItemRow[]) : []
}

function productStock(product: Row): number {
  const inv = product.inventory
  if (inv && typeof inv === "object") return Number((inv as { quantity?: unknown }).quantity ?? 0)
  return Number(product.stock ?? 0)
}

function groupByStatus(rows: Row[]): StatusGroup[] {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const key = r.status === null || r.status === undefined ? "" : String(r.status)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].map(([status, count]) => ({
    status: status === "" ? null : status,
    _count: { _all: count },
  }))
}

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [orders, products, categories, payments, refunds, leads, projects, tickets, customers, inquiries, reviews, messages] = await Promise.all([
      findMany<Row>(COLLECTIONS.orders, { limit: 200 }),
      findMany<Row>(COLLECTIONS.products, { limit: 100 }),
      findMany<Row>(COLLECTIONS.categories, { limit: 50 }),
      findMany<Row>(COLLECTIONS.payments, { limit: 200 }),
      findMany<Row>(COLLECTIONS.refunds, { limit: 100 }),
      findMany<Row>(COLLECTIONS.leads, { limit: 100 }),
      findMany<Row>(COLLECTIONS.projects, { limit: 100 }),
      findMany<Row>(COLLECTIONS.supportTickets, { limit: 100 }),
      findMany<Row>(COLLECTIONS.customers, { limit: 200 }),
      findMany<Row>(COLLECTIONS.contactInquiries, { limit: 200 }),
      findMany<Row>(COLLECTIONS.reviews, { limit: 200 }),
      findMany<Row>(COLLECTIONS.messages, { limit: 200 }),
    ])
    const customersTotal = customers.length
    const newCustomersThisMonth = customers.filter((c) => String(c.createdAt ?? "") >= startOfMonth.toISOString()).length
    const newCustomers30d = customers.filter((c) => String(c.createdAt ?? "") >= thirtyDaysAgo.toISOString()).length
    const productsTotal = products.filter((p) => p.isActive !== false).length
    const pendingReviews = reviews.filter((r) => r.status === "PENDING").length
    const newInquiries = inquiries.filter((q) => q.status === "NEW").length
    const totalInquiries = inquiries.length
    const unreadMessages = messages.filter((m) => !m.readAt).length
    const openTickets = tickets.filter((t) => t.status === "OPEN").length

    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID")
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0)

    const paid30 = paidOrders.filter((o) => String(o.createdAt ?? "") >= thirtyDaysAgo.toISOString())
    const revenue30d = paid30.reduce((sum, o) => sum + Number(o.total ?? 0), 0)

    const dayMap = new Map<string, number>()
    for (const o of paid30) {
      const key = String(o.createdAt ?? "").slice(0, 10)
      dayMap.set(key, (dayMap.get(key) ?? 0) + Number(o.total ?? 0))
    }
    const series: { date: string; revenue: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      series.push({ date: key, revenue: dayMap.get(key) ?? 0 })
    }

    const byStatus = groupByStatus(orders)
    const pendingOrders = orders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(String(o.status))).length
    const completedOrders = orders.filter((o) => o.status === "DELIVERED").length
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length

    const recentOrders = [...orders]
      .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
      .slice(0, 10)
    const recentUserIds = Array.from(new Set(recentOrders.map((o) => String(o.userId ?? "")).filter(Boolean)))
    const users = (await Promise.all(recentUserIds.map((id) => findById<Row>(COLLECTIONS.users, id)))).filter(Boolean) as Row[]
    const userMap = new Map(users.map((u) => [u.id, u]))
    const recent = recentOrders.map((o) => {
      const owner = userMap.get(String(o.userId ?? ""))
      return {
        ...o,
        user: owner
          ? { id: owner.id, firstName: owner.firstName ?? null, lastName: owner.lastName ?? null, email: owner.email ?? null }
          : null,
      }
    })

    const productMap = new Map(products.map((p) => [p.id, p]))
    const catNameMap = new Map(categories.map((c) => [c.id, String(c.name ?? "")]))
    const lowStockCount = products.filter((p) => {
      const stock = productStock(p)
      return stock > 0 && stock <= 10
    }).length
    const outOfStockCount = products.filter((p) => productStock(p) === 0).length

    const refundTotal = refunds
      .filter((r) => ["PENDING", "COMPLETED"].includes(String(r.status)))
      .reduce((sum, r) => sum + Number(r.amount ?? 0), 0)

    const leadStats = groupByStatus(leads)
    const projectStats = groupByStatus(projects)
    const ticketStats = groupByStatus(tickets)

    const productAgg = new Map<string, { quantity: number; revenue: number }>()
    for (const o of orders) {
      for (const item of orderItems(o)) {
        const productId = String(item.productId ?? "")
        if (!productId) continue
        const agg = productAgg.get(productId) ?? { quantity: 0, revenue: 0 }
        agg.quantity += Number(item.quantity ?? 0)
        agg.revenue += Number(item.total ?? 0)
        productAgg.set(productId, agg)
      }
    }
    const topProductsResolved = [...productAgg.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10)
      .map(([productId, agg]) => ({
        productId,
        name: String(productMap.get(productId)?.name ?? "Unknown"),
        quantity: agg.quantity,
        revenue: Number(agg.revenue),
      }))

    const categorySalesResolved = [...productAgg.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 100)
      .map(([productId, agg]) => {
        const product = productMap.get(productId)
        const catName = product ? catNameMap.get(String(product.categoryId ?? "")) : undefined
        return { category: catName ?? "Uncategorized", revenue: Number(agg.revenue) }
      })

    const methodAgg = new Map<string, { count: number; amount: number }>()
    for (const p of payments) {
      const key = p.method === null || p.method === undefined ? "" : String(p.method)
      const agg = methodAgg.get(key) ?? { count: 0, amount: 0 }
      agg.count += 1
      agg.amount += Number(p.amount ?? 0)
      methodAgg.set(key, agg)
    }
    const paymentMethods = [...methodAgg.entries()].map(([method, agg]) => ({
      method: method === "" ? null : method,
      _count: { _all: agg.count },
      _sum: { amount: Number(agg.amount) },
    }))

    const stats = {
      revenue: {
        total: Number(totalRevenue),
        last30Days: Number(revenue30d),
        series,
      },
      orders: {
        byStatus,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        total: orders.length,
        recent,
      },
      customers: {
        total: customersTotal,
        newThisMonth: newCustomersThisMonth,
        newLast30Days: newCustomers30d,
      },
      products: {
        total: productsTotal,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      refunds: {
        total: Number(refundTotal),
      },
      leads: {
        byStatus: leadStats,
      },
      projects: {
        byStatus: projectStats,
      },
      tickets: {
        byStatus: ticketStats,
      },
      topProducts: topProductsResolved,
      categorySales: categorySalesResolved,
      paymentMethods,
      approvals: {
        pendingReviews,
        newInquiries,
        totalInquiries,
        unreadMessages,
        openTickets,
      },
    }

    return success(res, stats, "Dashboard stats fetched")
  } catch (err) {
    next(err)
  }
}