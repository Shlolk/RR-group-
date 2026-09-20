import { COLLECTIONS, findById, getDb, now } from "@/services/db/firestore"
import { AppError } from "@/utils/api"

export interface CartItemRow {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  createdAt: string
}

interface CartDoc {
  id: string
  userId: string
  items?: CartItemRow[]
}

function itemKey(productId: string, variantId?: string | null) {
  return `${productId}:${variantId ?? ""}`
}

function getStockStatus(available: number, threshold: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (available <= 0) return "out-of-stock"
  if (available <= threshold) return "low-stock"
  return "in-stock"
}

async function loadCart(userId: string): Promise<CartDoc> {
  const doc = await findById<CartDoc>(COLLECTIONS.carts, userId)
  if (!doc) {
    await getDb().collection(COLLECTIONS.carts).doc(userId).set({ userId, items: [], createdAt: now() })
    return { id: userId, userId, items: [] }
  }
  return doc
}

async function enrich(cart: CartDoc) {
  const items: { id: string; productId: string; variantId?: string | null; name: string; slug: string; sku?: string; image?: string; price: number; originalPrice?: number | null; variantLabel?: string; variantName?: string; quantity: number; stock: number; stockStatus: string }[] = []
  for (const item of cart.items ?? []) {
    const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, item.productId)
    if (!product) continue
    const variant = Array.isArray(product.variants)
      ? (product.variants as { id?: string; value?: string; name?: string; price?: unknown; sku?: unknown; available?: boolean }[]).find(
          (v) => item.variantId && v.id === item.variantId,
        )
      : undefined
    const productImages = Array.isArray(product.images) ? (product.images as { url?: string }[]) : []
    items.push({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId ?? null,
      name: String(product.name ?? "Product"),
      slug: String(product.slug ?? ""),
      sku: variant ? String(variant.sku ?? product.sku ?? "") : String(product.sku ?? ""),
      image: productImages[0]?.url ?? "/placeholder.svg",
      price: Number(variant?.price ?? product.price ?? 0),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      variantLabel: variant?.value,
      variantName: variant?.name,
      quantity: item.quantity,
      stock: Number(product.stock ?? 0),
      stockStatus: getStockStatus(
        Number(product.stock ?? 0) - Number(product.reservedStock ?? 0),
        Number(product.lowStockThreshold ?? 5),
      ),
    })
  }
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return {
    id: cart.id,
    items,
    subtotal,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

export async function getCart(userId: string) {
  const cart = await loadCart(userId)
  return enrich(cart)
}

export async function addToCart(userId: string, item: { productId: string; variantId?: string | null; quantity: number }) {
  const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, item.productId)
  if (!product || product.isActive === false) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }

  if (item.variantId) {
    const variants = Array.isArray(product.variants) ? (product.variants as { id?: string; available?: boolean }[]) : []
    const variant = variants.find((v) => v.id === item.variantId)
    if (!variant || variant.available === false) {
      throw new AppError(400, "VARIANT_UNAVAILABLE", "Selected variant is not available")
    }
  }

  const available = Number(product.stock ?? 0) - Number(product.reservedStock ?? 0)
  if (available < item.quantity) {
    throw new AppError(422, "INSUFFICIENT_STOCK", `Only ${Math.max(0, available)} units available`)
  }

  const cart = await loadCart(userId)
  const items = cart.items ?? []
  const key = itemKey(item.productId, item.variantId)
  const existing = items.find((i) => i.id === key)

  if (existing) {
    const newQty = existing.quantity + item.quantity
    if (available < newQty) {
      throw new AppError(422, "INSUFFICIENT_STOCK", `Only ${Math.max(0, available)} units available`)
    }
    const updated = items.map((i) => (i.id === key ? { ...i, quantity: newQty } : i))
    await getDb().collection(COLLECTIONS.carts).doc(userId).update({ items: updated })
  } else {
    await getDb().collection(COLLECTIONS.carts).doc(userId).update({
      items: [
        ...items,
        {
          id: key,
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          createdAt: now(),
        },
      ],
    })
  }

  return getCart(userId)
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await loadCart(userId)
  const items = cart.items ?? []
  const existing = items.find((i) => i.id === itemId)
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Cart item not found")
  }

  const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, existing.productId)
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Cart item not found")
  }
  const available = Number(product.stock ?? 0) - Number(product.reservedStock ?? 0)
  if (available < quantity) {
    throw new AppError(422, "INSUFFICIENT_STOCK", `Only ${Math.max(0, available)} units available`)
  }

  await getDb().collection(COLLECTIONS.carts).doc(userId).update({
    items: items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
  })

  return getCart(userId)
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await loadCart(userId)
  await getDb().collection(COLLECTIONS.carts).doc(userId).update({
    items: (cart.items ?? []).filter((i) => i.id !== itemId),
  })
  return getCart(userId)
}

export async function clearCart(userId: string) {
  await loadCart(userId)
  await getDb().collection(COLLECTIONS.carts).doc(userId).update({ items: [] })
  return getCart(userId)
}
