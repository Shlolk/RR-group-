import { AppError, paginate } from "@/utils/api"
import { generateOrderNumber, generateInvoiceNumber } from "@/utils/slug"
import { sendOrderConfirmationEmail, sendInvoiceEmail, sendRefundEmail } from "@/emails/templates"
import {
  COLLECTIONS,
  create,
  findById,
  findMany,
  getDb,
  now,
  update,
} from "@/services/db/firestore"

const TAX_RATE = 0.18

interface OrderItem {
  id: string
  productId: string
  variantId?: string | null
  name: string
  sku?: string | null
  image?: string | null
  unitPrice: number
  quantity: number
  discount: number
  tax: number
  total: number
}

interface StatusHistoryEntry {
  id: string
  status: string
  note?: string | null
  createdAt: string
  changedById?: string | null
}

export async function getCartForCheckout(userId: string) {
  const cartDoc = await findById<{ id: string; userId: string; items?: { id: string; productId: string; variantId?: string | null; quantity: number }[] }>(
    COLLECTIONS.carts,
    userId,
  )
  const rawItems = cartDoc?.items ?? []
  if (!rawItems.length) {
    throw new AppError(400, "EMPTY_CART", "Your cart is empty")
  }
  const items = []
  for (const item of rawItems) {
    const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, item.productId)
    if (!product) continue
    const variant = Array.isArray(product.variants)
      ? (product.variants as { id?: string; price?: unknown; sku?: unknown; value?: string; name?: string }[]).find(
          (v) => item.variantId && v.id === item.variantId,
        )
      : undefined
    const images = Array.isArray(product.images) ? (product.images as { url?: string }[]) : []
    items.push({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId ?? null,
      product,
      variant: variant ?? null,
      quantity: item.quantity,
      unitPrice: Number(variant?.price ?? product.price ?? 0),
      name: String(product.name ?? "Product"),
      sku: variant ? String(variant.sku ?? product.sku ?? "") : String(product.sku ?? ""),
      image: images[0]?.url ?? null,
      stock: Number(product.stock ?? 0),
      reservedStock: Number(product.reservedStock ?? 0),
      taxRate: Number(product.taxRate ?? 18),
    })
  }
  if (!items.length) {
    throw new AppError(400, "EMPTY_CART", "Your cart is empty")
  }
  return { cartId: cartDoc?.id ?? userId, items }
}

export function computePricing(items: { price: number; quantity: number; taxRate: number }[], couponDiscount = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = Math.min(couponDiscount, subtotal)
  const shipping = subtotal - discount > 0 && subtotal - discount < 10000 ? 199 : 0
  const taxableBase = subtotal - discount + shipping
  const taxAmount = Math.round(taxableBase * TAX_RATE * 100) / 100
  const total = subtotal - discount + shipping + taxAmount
  return { subtotal, discount, shipping, taxAmount, total }
}

export async function validateCoupon(code: string, userId: string, subtotal: number) {
  const codes = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.coupons, {
    where: [{ field: "code", op: "==", value: code.toUpperCase() }],
    limit: 1,
  })
  const coupon = codes[0]
  if (!coupon || coupon.isActive === false) {
    throw new AppError(400, "INVALID_COUPON", "This coupon code is invalid or expired")
  }
  const dateNow = new Date()
  if (coupon.startsAt && new Date(String(coupon.startsAt)) > dateNow) {
    throw new AppError(400, "COUPON_NOT_STARTED", "This coupon is not active yet")
  }
  if (coupon.expiresAt && new Date(String(coupon.expiresAt)) < dateNow) {
    throw new AppError(400, "COUPON_EXPIRED", "This coupon has expired")
  }
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    throw new AppError(400, "COUPON_MIN_ORDER", `Minimum order value is ₹${Number(coupon.minOrderValue)}`)
  }
  if (coupon.usageLimit && Number(coupon.usageCount ?? 0) >= Number(coupon.usageLimit)) {
    throw new AppError(400, "COUPON_LIMIT", "This coupon has reached its usage limit")
  }
  const usageCount = (await listCouponUsage(coupon.id, userId)).length
  if (coupon.perUserLimit && usageCount >= Number(coupon.perUserLimit)) {
    throw new AppError(400, "COUPON_USED", "You have already used this coupon")
  }

  let discount = 0
  if (coupon.type === "PERCENTAGE") {
    discount = Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
    if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
      discount = Number(coupon.maxDiscount)
    }
  } else {
    discount = Number(coupon.value)
  }

  return { coupon, discount }
}

async function listCouponUsage(couponId: string, userId?: string) {
  const docs = (await getDb().collection(COLLECTIONS.couponsUsage).limit(1000).get()).docs
  let rows: Record<string, unknown>[] = docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
  if (couponId) rows = rows.filter((d) => d.couponId === couponId)
  if (userId) rows = rows.filter((d) => d.userId === userId)
  return rows
}

export async function createOrderFromCart(
  userId: string,
  input: {
    shippingAddressId?: string
    billingAddressId?: string
    shippingAddress?: {
      label: string
      fullName: string
      line1: string
      line2?: string
      city: string
      state: string
      postalCode: string
      country: string
      phone?: string
    }
    couponCode?: string
    notes?: string
  },
) {
  const cart = await getCartForCheckout(userId)

  const itemsForPricing = cart.items.map((item) => ({
    price: item.unitPrice,
    quantity: item.quantity,
    taxRate: item.taxRate,
  }))
  const baseSubtotal = itemsForPricing.reduce((sum, i) => sum + i.price * i.quantity, 0)

  let coupon: Awaited<ReturnType<typeof validateCoupon>> | null = null
  if (input.couponCode) {
    coupon = await validateCoupon(input.couponCode, userId, baseSubtotal)
  }

  const pricing = computePricing(itemsForPricing, coupon?.discount ?? 0)

  let shippingAddressId = input.shippingAddressId
  let billingAddressId = input.billingAddressId

  if (!shippingAddressId && input.shippingAddress) {
    const created = await create(COLLECTIONS.addresses, {
      userId,
      ...input.shippingAddress,
      isDefault: false,
    })
    shippingAddressId = created.id
  }
  if (!billingAddressId) {
    billingAddressId = shippingAddressId
  }

  const address = shippingAddressId
    ? await findById<Record<string, unknown> & { id: string } & { userId?: string }>(COLLECTIONS.addresses, shippingAddressId)
    : null
  if (!address || address.userId !== userId) {
    throw new AppError(400, "ADDRESS_REQUIRED", "Please provide a shipping address")
  }

  for (const item of cart.items) {
    const available = item.stock - item.reservedStock
    if (available < item.quantity) {
      throw new AppError(422, "INSUFFICIENT_STOCK", `${item.name} has only ${Math.max(0, available)} units available`)
    }
  }

  const customerId = userId
  const orderNumber = generateOrderNumber()

  const items: OrderItem[] = cart.items.map((item) => ({
    id: `${item.productId}:${item.variantId ?? ""}`,
    productId: item.productId,
    variantId: item.variantId ?? null,
    name: item.name,
    sku: item.sku,
    image: item.image,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    discount: 0,
    tax: Math.round(item.unitPrice * item.quantity * TAX_RATE * 100) / 100,
    total: item.unitPrice * item.quantity,
  }))

  const order = await create(COLLECTIONS.orders, {
    orderNumber,
    userId,
    customerId,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: null,
    subtotal: pricing.subtotal,
    discountAmount: pricing.discount,
    shippingCharge: pricing.shipping,
    taxAmount: pricing.taxAmount,
    total: pricing.total,
    couponCode: coupon?.coupon.code ?? null,
    currency: "INR",
    notes: input.notes ?? null,
    trackingNumber: null,
    expectedDelivery: null,
    cancelledAt: null,
    cancelReason: null,
    shippingAddressId: shippingAddressId ?? null,
    billingAddressId: billingAddressId ?? null,
    items,
    statusHistory: [
      {
        id: `h1`,
        status: "PENDING",
        note: "Order created",
        createdAt: now(),
      },
    ],
  })

  for (const item of cart.items) {
    const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, item.productId)
    if (product) {
      await update(COLLECTIONS.products, item.productId, {
        stock: Math.max(0, Number(product.stock ?? 0) - item.quantity),
      })
    }
    await getDb().collection(COLLECTIONS.inventoryMovements).add({
      productId: item.productId,
      type: "OUT",
      quantity: item.quantity,
      reference: `order:${order.id}`,
      note: `Reserved for order ${orderNumber}`,
      createdAt: now(),
    })
  }

  if (coupon) {
    await update(COLLECTIONS.coupons, coupon.coupon.id, {
      usageCount: Number(coupon.coupon.usageCount ?? 0) + 1,
    })
    await getDb().collection(COLLECTIONS.couponsUsage).add({
      couponId: coupon.coupon.id,
      userId,
      orderId: order.id,
      createdAt: now(),
    })
  }

  await getDb().collection(COLLECTIONS.carts).doc(userId).update({ items: [] })

  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, userId)
  sendOrderConfirmationEmail(String(user?.email ?? ""), orderNumber, `₹${Number(order.total)}`, ["Order placed"])

  return { ...order, items, statusHistory: order.statusHistory }
}

export async function getOrders(userId: string, query: { page?: number; perPage?: number }) {
  const { page, perPage } = paginate(query.page ?? 1, query.perPage ?? 10)
  let orders = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, {
    where: [{ field: "userId", op: "==", value: userId }],
    limit: 1000,
  })
  orders = orders.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
  const total = orders.length
  const items = orders.slice((page - 1) * perPage, page * perPage).map((o) => ({ ...o, items: o.items ?? [] }))
  return { items, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } }
}

async function hydrateOrder(order: Record<string, unknown> & { id: string }) {
  let shippingAddress: Record<string, unknown> | null = null
  let billingAddress: Record<string, unknown> | null = null
  if (order.shippingAddressId) {
    shippingAddress = await findById(COLLECTIONS.addresses, String(order.shippingAddressId))
  }
  if (order.billingAddressId && order.billingAddressId !== order.shippingAddressId) {
    billingAddress = await findById(COLLECTIONS.addresses, String(order.billingAddressId))
  }

  let payments: Record<string, unknown>[] = []
  try {
    const paymentDocs = await findMany(COLLECTIONS.payments, { limit: 1000 })
    payments = paymentDocs.filter((p) => p.orderId === order.id)
  } catch {
    payments = []
  }

  let invoice: Record<string, unknown> | null = null
  try {
    const invoiceDocs = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.invoices, { limit: 1000 })
    invoice = invoiceDocs.find((i) => i.orderId === order.id) ?? null
  } catch {
    invoice = null
  }

  return {
    ...order,
    items: Array.isArray(order.items) ? order.items : [],
    statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [],
    shippingAddress: shippingAddress ?? null,
    billingAddress: billingAddress ?? null,
    payments,
    invoice,
  } as Record<string, unknown> & { id: string }
}

export async function getOrderById(orderId: string, userId?: string, isStaff = false) {
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  if (!isStaff && order.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this order")
  }
  return hydrateOrder(order)
}

export async function getOrderByNumber(orderNumber: string, userId?: string, isStaff = false) {
  const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, {
    where: [{ field: "orderNumber", op: "==", value: orderNumber }],
    limit: 1,
  })
  const order = rows[0]
  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  if (!isStaff && order.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this order")
  }
  return {
    ...order,
    items: Array.isArray(order.items) ? order.items : [],
    shippingAddress: order.shippingAddressId ? await findById(COLLECTIONS.addresses, String(order.shippingAddressId)) : null,
    statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [],
  }
}

export async function cancelOrder(orderId: string, userId: string, reason?: string) {
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order || order.userId !== userId) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  const cancellable: string[] = ["PENDING", "CONFIRMED", "PROCESSING"]
  if (!cancellable.includes(String(order.status))) {
    throw new AppError(400, "NOT_CANCELLABLE", "This order can no longer be cancelled")
  }

  const history = Array.isArray(order.statusHistory) ? (order.statusHistory as StatusHistoryEntry[]) : []
  await update(COLLECTIONS.orders, orderId, {
    status: "CANCELLED",
    cancelledAt: now(),
    cancelReason: reason ?? null,
    statusHistory: [
      ...history,
      { id: `h${history.length + 1}`, status: "CANCELLED", note: reason || "Cancelled by customer", createdAt: now() },
    ],
  })

  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : []
  for (const item of items) {
    const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, item.productId)
    if (product) {
      await update(COLLECTIONS.products, item.productId, {
        stock: Number(product.stock ?? 0) + item.quantity,
      })
    }
    await getDb().collection(COLLECTIONS.inventoryMovements).add({
      productId: item.productId,
      type: "IN",
      quantity: item.quantity,
      reference: `order-cancel:${orderId}`,
      note: "Stock returned from cancelled order",
      createdAt: now(),
    })
  }

  return { ...order, status: "CANCELLED", cancelledAt: now(), statusHistory: history }
}

export async function getAllOrders(query: { page?: number; perPage?: number; search?: string; status?: string; paymentStatus?: string }) {
  const { page, perPage } = paginate(query.page ?? 1, query.perPage ?? 20)
  let orders = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, { limit: 1000 })
  if (query.search) {
    const q = String(query.search).toLowerCase()
    orders = orders.filter(
      (o) =>
        String(o.orderNumber ?? "").toLowerCase().includes(q) ||
        String(o.userEmail ?? "").toLowerCase().includes(q) ||
        String(o.userName ?? "").toLowerCase().includes(q),
    )
  }
  if (query.status) orders = orders.filter((o) => o.status === query.status)
  if (query.paymentStatus) orders = orders.filter((o) => o.paymentStatus === query.paymentStatus)
  orders = orders.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
  const total = orders.length
  const items = orders.slice((page - 1) * perPage, page * perPage).map((o) => ({ ...o, items: o.items ?? [] }))
  return { items, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } }
}

export async function updateOrderStatus(orderId: string, status: string, note?: string, actorId?: string) {
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  const enums = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED", "FAILED"] as const
  const enumStatus = enums.includes(status as (typeof enums)[number]) ? status : "PENDING"
  const history = Array.isArray(order.statusHistory) ? (order.statusHistory as StatusHistoryEntry[]) : []
  await update(COLLECTIONS.orders, orderId, {
    status: enumStatus,
    statusHistory: [
      ...history,
      { id: `h${history.length + 1}`, status: enumStatus, note: note || `Status changed to ${status}`, changedById: actorId ?? null, createdAt: now() },
    ],
  })
  const updated = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  return { ...(updated ?? order), statusHistory: Array.isArray(updated?.statusHistory) ? updated.statusHistory : (order.statusHistory ?? []) }
}

export async function createInvoiceForOrder(orderId: string) {
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }

  const invoiceDocs = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.invoices, { limit: 1000 })
  const existing = invoiceDocs.find((i) => i.orderId === orderId)
  if (existing) {
    return { ...existing, items: Array.isArray(existing.items) ? existing.items : [] }
  }

  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : []
  const invoice = await create(COLLECTIONS.invoices, {
    invoiceNumber: generateInvoiceNumber(),
    customerId: order.customerId ?? null,
    userId: order.userId,
    orderId: order.id,
    status: order.paymentStatus === "PAID" ? "PAID" : "PENDING",
    subtotal: order.subtotal ?? 0,
    discountAmount: order.discountAmount ?? 0,
    taxAmount: order.taxAmount ?? 0,
    total: order.total ?? 0,
    dueDate: null,
    paidAt: null,
    notes: null,
    items: items.map((item) => ({
      description: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: 18,
      total: item.total,
    })),
  })

  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, String(order.userId ?? ""))
  if (user?.email) {
    sendInvoiceEmail(String(user.email), String(invoice.invoiceNumber), `₹${Number(invoice.total)}`)
  }

  invoice.items = invoice.items ?? items
  return invoice
}

export async function listInvoices(userId?: string, isStaff = false, query: { page?: number; perPage?: number } = {}) {
  const { page, perPage } = paginate(query.page ?? 1, query.perPage ?? 10)
  let invoices = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.invoices, { limit: 1000 })
  if (userId && !isStaff) {
    invoices = invoices.filter((i) => i.userId === userId)
  }
  invoices = invoices.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
  const total = invoices.length
  const items = invoices.slice((page - 1) * perPage, page * perPage).map((i) => ({
    ...i,
    items: Array.isArray(i.items) ? i.items : [],
    order: i.orderId ? { orderNumber: i.orderNumber ?? null } : null,
  }))
  return { items, pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) } }
}

export async function getInvoiceById(invoiceId: string, userId?: string, isStaff = false) {
  const invoice = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.invoices, invoiceId)
  if (!invoice) {
    throw new AppError(404, "NOT_FOUND", "Invoice not found")
  }
  if (!isStaff && invoice.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this invoice")
  }
  return { ...invoice, items: Array.isArray(invoice.items) ? invoice.items : [] }
}

export async function createManualInvoice(data: {
  userId: string
  customerId?: string
  items: { description: string; quantity: number; unitPrice: number; taxRate?: number }[]
  notes?: string
  dueDate?: string
}) {
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + taxAmount

  const invoice = await create(COLLECTIONS.invoices, {
    invoiceNumber: generateInvoiceNumber(),
    userId: data.userId,
    customerId: data.customerId ?? null,
    status: "PENDING",
    subtotal,
    discountAmount: 0,
    taxAmount,
    total,
    notes: data.notes ?? null,
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    paidAt: null,
    orderId: null,
    items: data.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate ?? 18,
      total: item.quantity * item.unitPrice,
    })),
  })
  return { ...invoice, items: invoice.items ?? [] }
}

export async function initiateRefund(orderId: string, amount: number, reason?: string, actorId?: string) {
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }
  const payments = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.payments, { limit: 1000 })
  const paid = payments.filter((p) => p.orderId === orderId && p.status === "PAID").sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
  if (!paid.length) {
    throw new AppError(400, "NO_PAYMENT", "No paid payment found for this order")
  }

  const payment = paid[0]
  const refund = await create(COLLECTIONS.refunds, {
    paymentId: payment.id,
    orderId: order.id,
    amount,
    reason: reason ?? null,
    initiatedById: actorId ?? null,
    status: "PENDING",
  })

  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, String(order.userId ?? ""))
  if (user?.email) {
    sendRefundEmail(String(user.email), String(order.orderNumber ?? ""), `₹${amount}`)
  }

  return refund
}
