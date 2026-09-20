import { AppError } from "@/utils/api"
import {
  COLLECTIONS,
  findById,
  findMany,
  getDb,
} from "@/services/db/firestore"

export interface ToolContext {
  userId?: string
  role?: string
  isStaff?: boolean
}

const pageLimit = 500

function stockOf(p: Record<string, unknown>): number {
  const inventory = p.inventory as { quantity?: number } | undefined
  return Number(inventory?.quantity ?? p.stock ?? 0)
}

export async function productSearch(query: string, limit = 5) {
  if (!query?.trim()) return []
  const q = query.trim().toLowerCase()
  const rows = (await findMany(COLLECTIONS.products, { limit: pageLimit })).filter((p) => p.isActive !== false)
  const matches = rows.filter((p) => {
    const name = String(p.name ?? "").toLowerCase()
    const description = String(p.shortDescription ?? "").toLowerCase() + " " + String(p.description ?? "").toLowerCase()
    const tags = Array.isArray(p.tags) ? p.tags.map((t) => String(t).toLowerCase()).join(" ") : ""
    const category = String(p.categoryName ?? "").toLowerCase()
    return name.includes(q) || description.includes(q) || tags.includes(q) || category.includes(q)
  })
  return matches.slice(0, limit).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    shortDescription: p.shortDescription ?? null,
    stock: stockOf(p),
    isActive: true,
    category: { name: p.categoryName ?? "Uncategorized" },
    images: Array.isArray(p.images) && p.images.length ? [{ url: (p.images as { url?: string }[])[0].url }] : [],
  }))
}

export async function productDetails(productId: string) {
  const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, productId)
  if (!product || product.isActive === false) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription ?? null,
    description: product.description ?? null,
    price: product.price ?? 0,
    originalPrice: product.originalPrice ?? null,
    stock: stockOf(product),
    sku: product.sku ?? null,
    brand: product.brand ?? null,
    taxRate: product.taxRate ?? 0,
    isActive: true,
    category: { name: product.categoryName ?? "Uncategorized" },
    variants: product.variants ?? [],
    attributes: product.attributes ?? [],
  }
}

export async function inventoryCheck(productId: string) {
  const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, productId)
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }
  const stock = stockOf(product)
  const reservedStock = Number(product.reservedStock ?? 0)
  const lowStockThreshold = Number(product.lowStockThreshold ?? 5)
  const available = stock - reservedStock
  return {
    id: product.id,
    name: product.name,
    stock,
    reservedStock,
    lowStockThreshold,
    isActive: product.isActive !== false,
    available,
    status: available <= 0 ? "OUT_OF_STOCK" : available <= lowStockThreshold ? "LOW_STOCK" : "IN_STOCK",
  }
}

export async function faqSearch(query: string, limit = 5) {
  if (!query?.trim()) return []
  const q = query.trim().toLowerCase()
  const rows = (await findMany(COLLECTIONS.faqs, { limit: pageLimit })).filter((f) => f.isActive !== false)
  return rows
    .filter((f) => String(f.question ?? "").toLowerCase().includes(q) || String(f.answer ?? "").toLowerCase().includes(q))
    .slice(0, limit)
}

export async function cartAssistance(ctx: ToolContext) {
  if (!ctx.userId) return { error: "Login required" }
  const cart = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.carts, ctx.userId)
  const items = Array.isArray(cart?.items) ? (cart.items as { productId: string; variantId?: string | null; quantity: number }[]) : []
  if (!cart || items.length === 0) {
    return { items: [], total: 0 }
  }

  const productIds = [...new Set(items.map((i) => i.productId))]
  const productsById = new Map<string, Record<string, unknown>>()
  for (const id of productIds) {
    const p = await findById(COLLECTIONS.products, id)
    if (p) productsById.set(id, p)
  }

  const resolved = items
    .map((i) => {
      const p = productsById.get(i.productId)
      if (!p) return null
      const variant = i.variantId
        ? (Array.isArray(p.variants) ? (p.variants as Record<string, unknown>[]).find((v) => v.id === i.variantId) : undefined)
        : undefined
      const price = Number(variant?.price ?? p.price ?? 0)
      return {
        name: String(p.name ?? "Product"),
        variant: variant ? `${variant.name}: ${variant.value}` : undefined,
        price,
        quantity: i.quantity,
        subtotal: price * i.quantity,
      }
    })
    .filter(Boolean) as { name: string; variant?: string; price: number; quantity: number; subtotal: number }[]

  return {
    items: resolved,
    total: resolved.reduce((sum, i) => sum + i.subtotal, 0),
  }
}

export async function orderStatus(ctx: ToolContext, orderNumber?: string) {
  if (!ctx.userId) return { error: "Login required" }
  if (!orderNumber) return { error: "Please provide an order number" }
  const rows = (await findMany(COLLECTIONS.orders, { limit: pageLimit }))
  const order = rows.find(
    (o) =>
      o.orderNumber === orderNumber &&
      (ctx.isStaff ? true : o.userId === ctx.userId),
  ) as (Record<string, unknown> & { id: string }) | undefined
  if (!order) {
    if (ctx.isStaff) return { error: "Order not found" }
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt,
items: Array.isArray(order.items)
      ? (order.items as { name?: string; quantity?: number; unitPrice?: number; price?: number }[]).map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice ?? i.price,
        }))
      : [],
  }
}

export async function paymentStatus(ctx: ToolContext, orderNumber?: string) {
  if (!ctx.userId) return { error: "Login required" }
  if (!orderNumber) return { error: "Please provide an order number" }
  const rows = (await findMany(COLLECTIONS.orders, { limit: pageLimit }))
  const order = rows.find(
    (o) =>
      o.orderNumber === orderNumber &&
      (ctx.isStaff ? true : o.userId === ctx.userId),
  ) as (Record<string, unknown> & { id: string }) | undefined
  if (!order) {
    if (ctx.isStaff) return { error: "Order not found" }
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  let payments: Record<string, unknown>[] = []
  if (order.id) {
    payments = (await findMany(COLLECTIONS.payments, { limit: pageLimit })).filter((p) => p.orderId === order.id)
  }
  return {
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    payments: payments.map((p) => ({
      method: p.method,
      provider: p.provider,
      status: p.status,
      amount: p.amount,
      createdAt: p.createdAt,
    })),
  }
}

export async function invoiceLookup(ctx: ToolContext, invoiceNumber?: string) {
  if (!ctx.userId) return { error: "Login required" }
  if (!invoiceNumber) return { error: "Please provide an invoice number" }
  const rows = (await findMany(COLLECTIONS.invoices, { limit: pageLimit }))
  const invoice = rows.find(
    (i) =>
      i.invoiceNumber === invoiceNumber &&
      (ctx.isStaff ? true : i.userId === ctx.userId),
  ) as (Record<string, unknown> & { id: string }) | undefined
  if (!invoice) {
    if (ctx.isStaff) return { error: "Invoice not found" }
    throw new AppError(404, "NOT_FOUND", "Invoice not found")
  }
  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    total: invoice.total,
    subtotal: invoice.subtotal,
    taxAmount: invoice.taxAmount,
    discountAmount: invoice.discountAmount,
    createdAt: invoice.createdAt,
    items: Array.isArray(invoice.items)
      ? (invoice.items as { description?: string; quantity?: number; total?: number }[])
      : [],
  }
}

export async function userSupportTickets(ctx: ToolContext) {
  if (!ctx.userId) return { error: "Login required" }
  const rows = (await findMany(COLLECTIONS.supportTickets, { limit: pageLimit }))
    .filter((t) => (ctx.isStaff ? true : t.userId === ctx.userId))
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    .slice(0, 10)

  const result: Record<string, unknown>[] = []
  for (const t of rows) {
    const messageCount = (await getDb().collection(COLLECTIONS.messages).where("ticketId", "==", t.id).count().get()).data().count
    result.push({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      _count: { messages: messageCount },
    })
  }
  return result
}

export async function companyInfo() {
  return {
    name: "RR GROUP",
    tagline: "Building Digital Solutions That Drive Business Growth",
    business: "Digital Technology & Business Solutions",
    services: [
      "Website Development",
      "ERP Software Solutions",
      "CRM Software Solutions",
      "Digital Marketing",
    ],
  }
}

export async function runTool(name: string, args: Record<string, unknown>, ctx: ToolContext) {
  switch (name) {
    case "product-search":
      return { products: await productSearch(String(args.query ?? ""), Number(args.limit ?? 5)) }
    case "product-details":
      return { product: await productDetails(String(args.productId ?? "")) }
    case "inventory-check":
      return { inventory: await inventoryCheck(String(args.productId ?? "")) }
    case "faq-search":
      return { faqs: await faqSearch(String(args.query ?? ""), Number(args.limit ?? 5)) }
    case "cart-assistance":
      return cartAssistance(ctx)
    case "order-status":
      return orderStatus(ctx, args.orderNumber ? String(args.orderNumber) : undefined)
    case "payment-status":
      return paymentStatus(ctx, args.orderNumber ? String(args.orderNumber) : undefined)
    case "invoice-lookup":
      return invoiceLookup(ctx, args.invoiceNumber ? String(args.invoiceNumber) : undefined)
    case "support-tickets":
      return userSupportTickets(ctx)
    case "company-info":
      return companyInfo()
    default:
      return { error: `Unknown tool: ${name}` }
  }
}
