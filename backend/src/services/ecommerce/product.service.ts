import { AppError } from "@/utils/api"
import { slugify } from "@/utils/slug"
import {
  COLLECTIONS,
  create,
  findById,
  findMany,
  getDb,
  now,
  update,
} from "@/services/db/firestore"

interface ProductDoc extends Record<string, unknown> {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number | null
  stock: number
  reservedStock?: number
  lowStockThreshold?: number
  isActive?: boolean
  categoryId?: string | null
}

function normalizeImages(images: unknown): unknown {
  if (!images) return []
  if (Array.isArray(images)) {
    return images.map((img, i) => {
      if (typeof img === "string") return { url: img, position: i, alt: null }
      return { ...(img as object), position: (img as { position?: number }).position ?? i }
    })
  }
  return []
}

function normalizeVariants(variants: unknown): unknown {
  if (!Array.isArray(variants)) return []
  return (variants as { id?: string; name?: string; value?: string; available?: boolean; price?: unknown; sku?: unknown; stock?: unknown }[]).map((v, i) => ({
    id: v.id ?? `v-${i + 1}`,
    name: v.name ?? "Default",
    value: v.value ?? "Default",
    price: v.price ?? null,
    sku: v.sku ?? null,
    stock: Number(v.stock ?? 0),
    available: v.available ?? true,
  }))
}

function normalizeAttributes(attributes: unknown): unknown {
  if (!Array.isArray(attributes)) return []
  return (attributes as { id?: string; name?: string; value?: string }[]).map((a, i) => ({
    id: a.id ?? `a-${i + 1}`,
    name: a.name ?? "",
    value: a.value ?? "",
  }))
}

async function fetchCategory(slug?: string | null) {
  if (!slug) return null
  const rows = await findMany(COLLECTIONS.categories, { where: [{ field: "slug", op: "==", value: slug }], limit: 1 })
  if (!rows.length) return null
  const c = rows[0]
  return { id: c.id, slug: c.slug, name: c.name, description: c.description ?? null, image: c.image ?? null, active: c.active ?? true, order: c.order ?? 0 }
}

export async function listProducts(query: {
  page?: number
  perPage?: number
  category?: string
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  active?: boolean
}) {
  const page = Math.max(1, Number(query.page ?? 1))
  const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? 20)))

  let rows = await findMany<ProductDoc>(COLLECTIONS.products, { limit: 1000 })
  if (query.active === undefined || query.active === true) {
    rows = rows.filter((r) => r.isActive !== false)
  }
  if (query.category) {
    rows = rows.filter((r) => r.categoryId === query.category)
  }
  if (query.search) {
    const q = query.search.toLowerCase()
    rows = rows.filter((r) => {
      const name = String(r.name ?? "").toLowerCase()
      const desc = String(r.shortDescription ?? r.description ?? "").toLowerCase()
      const sku = String(r.sku ?? "").toLowerCase()
      const brand = String(r.brand ?? "").toLowerCase()
      return name.includes(q) || desc.includes(q) || sku.includes(q) || brand.includes(q)
    })
  }
  if (query.minPrice !== undefined) {
    rows = rows.filter((r) => Number(r.price) >= query.minPrice!)
  }
  if (query.maxPrice !== undefined) {
    rows = rows.filter((r) => Number(r.price) <= query.maxPrice!)
  }
  if (query.inStock) {
    rows = rows.filter((r) => Number(r.stock) > 0)
  }
  if (query.featured) {
    rows = rows.filter((r) => r.isFeatured === true)
  }

  switch (query.sort) {
    case "new":
      rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
      break
    case "price-asc":
      rows.sort((a, b) => Number(a.price) - Number(b.price))
      break
    case "price-desc":
      rows.sort((a, b) => Number(b.price) - Number(a.price))
      break
    case "rating":
      rows.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
      break
    case "discount":
    case "deal":
      rows.sort((a, b) => Number(b.originalPrice ?? 0) - Number(a.originalPrice ?? 0))
      break
    case "popular":
    default:
      rows.sort((a, b) => Number(b.popularity ?? 0) - Number(a.popularity ?? 0))
  }

  const total = rows.length
  const itemsRaw = rows.slice((page - 1) * perPage, page * perPage)
  const items = await Promise.all(
    itemsRaw.map(async (r) => ({
      ...r,
      category: await fetchCategory(String(r.categoryId ?? "")),
    })),
  )

  return {
    items,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  }
}

export async function getProductBySlug(slug: string, activeOnly = true) {
  const rows = await findMany<ProductDoc>(COLLECTIONS.products, {
    where: [{ field: "slug", op: "==", value: slug }],
    limit: 1,
  })
  const product = rows[0]
  if (!product || (activeOnly && product.isActive === false)) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }

  const category = await fetchCategory(String(product.categoryId ?? ""))

  let reviews: unknown[] = []
  try {
    const reviewRows = await findMany<{ id: string; productId?: string; status?: string; createdAt?: string }>(COLLECTIONS.reviews, {
      limit: 500,
    })
    reviews = reviewRows
      .filter((r) => r.productId === product.id && (r.status === "APPROVED" || !r.status))
      .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
      .slice(0, 50)
  } catch {
    reviews = []
  }

  return { ...product, category, reviews }
}

export async function getRelatedProducts(productId: string, categoryId?: string | null, limit = 4) {
  let rows = await findMany<ProductDoc>(COLLECTIONS.products, {
    where: [{ field: "isActive", op: "==", value: true }],
    limit: 500,
  })
  if (categoryId) {
    rows = rows.filter((r) => r.categoryId === categoryId)
  }
  rows = rows.filter((r) => r.id !== productId)
  rows.sort((a, b) => Number(b.popularity ?? 0) - Number(a.popularity ?? 0))
  return rows.slice(0, limit)
}

export async function searchProducts(query: string, limit = 10) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const rows = await findMany<ProductDoc>(COLLECTIONS.products, {
    where: [{ field: "isActive", op: "==", value: true }],
    limit: 500,
  })
  return rows
    .filter((r) => {
      const name = String(r.name ?? "").toLowerCase()
      const desc = String(r.description ?? "").toLowerCase()
      const tags = Array.isArray(r.tags) ? r.tags.map(String).map((t) => t.toLowerCase()) : []
      return name.includes(q) || desc.includes(q) || tags.some((t) => t.includes(q))
    })
    .slice(0, limit)
}

export async function listCategories(includeInactive = false) {
  const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.categories, { limit: 200 })
  const allProducts = await findMany<ProductDoc>(COLLECTIONS.products, { limit: 1000 })
  const categories = rows
    .filter((c) => includeInactive || c.active !== false)
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .map((c) => ({
      ...c,
      _count: { products: allProducts.filter((p) => p.categoryId === c.id && p.isActive !== false).length },
    }))
  return categories
}

export async function createProduct(data: Record<string, unknown>) {
  const slug = String(data.slug ?? slugify(String(data.name ?? "product")))
  const existing = await findMany(COLLECTIONS.products, { where: [{ field: "slug", op: "==", value: slug }], limit: 1 })
  if (existing.length) {
    throw new AppError(409, "SLUG_TAKEN", "A product with this slug already exists")
  }

  const doc = {
    ...(data as Record<string, unknown>),
    slug,
    images: normalizeImages(data.images),
    variants: normalizeVariants(data.variants),
    attributes: normalizeAttributes(data.attributes),
    reservedStock: Number(data.reservedStock ?? 0),
    lowStockThreshold: Number(data.lowStockThreshold ?? 5),
    taxRate: Number(data.taxRate ?? 18),
    isDigital: Boolean(data.isDigital),
    rating: Number(data.rating ?? 0),
    reviewCount: Number(data.reviewCount ?? 0),
    popularity: Number(data.popularity ?? 0),
    isActive: data.isActive ?? true,
    createdAt: now(),
    updatedAt: now(),
  }
  const created = await create(COLLECTIONS.products, doc)
  return { ...created, category: await fetchCategory(String(created.categoryId ?? "")) } as Record<string, unknown> & { id: string }
}

export async function updateProduct(productId: string, data: Record<string, unknown>) {
  const existing = await findById<ProductDoc>(COLLECTIONS.products, productId)
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }
  const patch: Record<string, unknown> = { ...(data as Record<string, unknown>) }
  if (patch.images !== undefined) patch.images = normalizeImages(patch.images)
  if (patch.variants !== undefined) patch.variants = normalizeVariants(patch.variants)
  if (patch.attributes !== undefined) patch.attributes = normalizeAttributes(patch.attributes)
  await update(COLLECTIONS.products, productId, patch)
  const updated = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, productId)
  return { ...(updated ?? {}), category: await fetchCategory(String(updated?.categoryId ?? "")) } as Record<string, unknown> & { id: string }
}

export async function deleteProduct(productId: string) {
  const existing = await findById<ProductDoc>(COLLECTIONS.products, productId)
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }
  await update(COLLECTIONS.products, productId, { isActive: false })
  return { id: productId, deactivated: true }
}

export async function adjustInventory(
  productId: string,
  type: "IN" | "OUT" | "ADJUST" | "RESERVE" | "RELEASE",
  quantity: number,
  note?: string,
  reference?: string,
  actorId?: string,
) {
  const product = await findById<ProductDoc>(COLLECTIONS.products, productId)
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found")
  }

  let newStock = Number(product.stock ?? 0)
  let newReserved = Number(product.reservedStock ?? 0)

  switch (type) {
    case "IN":
      newStock += quantity
      break
    case "OUT":
      if (newStock < quantity) {
        throw new AppError(400, "INSUFFICIENT_STOCK", "Not enough stock available")
      }
      newStock -= quantity
      break
    case "ADJUST":
      newStock = quantity
      break
    case "RESERVE":
      if (newStock - newReserved < quantity) {
        throw new AppError(400, "INSUFFICIENT_STOCK", "Not enough available stock")
      }
      newReserved += quantity
      break
    case "RELEASE":
      newReserved = Math.max(0, newReserved - quantity)
      break
  }

  await update(COLLECTIONS.products, productId, { stock: newStock, reservedStock: newReserved })
  await getDb().collection(COLLECTIONS.inventoryMovements).add({
    productId,
    type,
    quantity,
    note: note ?? null,
    reference: reference ?? null,
    createdById: actorId ?? null,
    createdAt: now(),
  })

  return { id: productId, stock: newStock, reservedStock: newReserved }
}

export async function getInventoryList(query: { search?: string; lowStock?: boolean; outOfStock?: boolean }) {
  let rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.products, { limit: 1000 })
  if (query.search) {
    const q = query.search.toLowerCase()
    rows = rows.filter((r) => String(r.name ?? "").toLowerCase().includes(q) || String(r.sku ?? "").toLowerCase().includes(q))
  }
  if (query.lowStock) {
    rows = rows.filter((r) => Number(r.stock ?? 0) > 0 && Number(r.stock ?? 0) <= Number(r.lowStockThreshold ?? 10))
  }
  if (query.outOfStock) {
    rows = rows.filter((r) => Number(r.stock ?? 0) === 0)
  }
  return rows
    .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
    .map((r) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      stock: Number(r.stock ?? 0),
      reservedStock: Number(r.reservedStock ?? 0),
      lowStockThreshold: Number(r.lowStockThreshold ?? 5),
      isActive: r.isActive !== false,
      price: Number(r.price ?? 0),
    }))
}

export async function getInventoryTransactions(productId?: string, limit = 50) {
  const docs = (await getDb().collection(COLLECTIONS.inventoryMovements).limit(1000).get()).docs
  let rows: Record<string, unknown>[] = docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
  if (productId) {
    rows = rows.filter((r) => r.productId === productId)
  }
  rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
  const top = rows.slice(0, limit)
  const products = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.products, { limit: 1000 })
  return top.map((t) => {
    const p = products.find((x) => x.id === t.productId)
    return { ...t, product: { id: t.productId, name: p?.name ?? null, sku: p?.sku ?? null } }
  })
}