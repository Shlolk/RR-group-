import type {
  ApiCart,
  ApiCartItem,
  ApiCategory,
  ApiProduct,
  ApiProductVariant,
  ApiWishlistItem,
} from "@/lib/api-types"
import type { CartItem, Category, Product, ProductReview, ProductSpec, ProductVariant, StockStatus } from "@/lib/types"

export function stockStatus(stock: number, threshold = 5): StockStatus {
  if (stock <= 0) return "out-of-stock"
  if (stock <= threshold) return "low-stock"
  return "in-stock"
}

export function toCategory(cat?: ApiCategory | null): Category | null {
  if (!cat) return null
  return {
    slug: cat.slug,
    name: cat.name,
    description: cat.description ?? "",
    image: cat.image ?? "/placeholder.svg",
    productCount: cat._count?.products ?? 0,
  }
}

export function badgeFor(product: ApiProduct): Product["badge"] {
  const discount = product.originalPrice
    ? (Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)
    : 0
  if (discount >= 0.15) return "sale"
  if (product.tags.includes("bestseller")) return "bestseller"
  if (product.tags.includes("new")) return "new"
  if (product.isFeatured) return "bestseller"
  return undefined
}

function toVariant(v: ApiProductVariant): ProductVariant {
  return {
    id: v.id,
    label: v.name,
    value: v.value,
    available: v.available,
  }
}

function toSpecs(product: ApiProduct): ProductSpec[] {
  const specs: ProductSpec[] = []
  if (product.brand) specs.push({ label: "Brand", value: product.brand })
  if (product.sku) specs.push({ label: "SKU", value: product.sku })
  if (product.category?.name) specs.push({ label: "Category", value: product.category.name })
  if (product.isDigital) specs.push({ label: "Delivery", value: "Digital download" })
  if (product.taxRate) specs.push({ label: "GST", value: `${Number(product.taxRate)}%` })
  specs.push({ label: "Warranty", value: "1 year" })
  return specs
}

function toReviews(product: ApiProduct): ProductReview[] {
  return (product.reviews ?? []).map((r) => ({
    id: r.id,
    author: r.user ? `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim() || "Verified Customer" : "Verified Customer",
    avatarInitials: r.user ? `${r.user.firstName?.[0] ?? ""}${r.user.lastName?.[0] ?? ""}`.toUpperCase() : "RR",
    rating: r.rating,
    date: r.createdAt,
    title: r.title ?? "",
    body: r.body ?? "",
    verified: r.verified,
  }))
}

export function toProduct(p: ApiProduct): Product {
  const category = toCategory(p.category)
  const variants = p.variants?.length
    ? p.variants
    : [
        { name: "", value: "", available: true } as unknown as ApiProductVariant,
      ]
  const grouped = variants.reduce<Record<string, ApiProductVariant[]>>((acc, v) => {
    const key = v.name || "Default"
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: category?.name ?? "Uncategorized",
    categorySlug: category?.slug ?? "",
    brand: p.brand ?? "RR GROUP",
    sku: p.sku,
    shortDescription: p.shortDescription ?? p.description,
    description: p.description,
    images: p.images?.length ? p.images.map((img) => img.url) : ["/placeholder.svg"],
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : Number(p.price),
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    stock: Math.max(0, p.stock - p.reservedStock),
    stockStatus: stockStatus(Math.max(0, p.stock - p.reservedStock), p.lowStockThreshold),
    badge: badgeFor(p),
    variants: Object.entries(grouped).map(([name, opts]) => ({
      name,
      options: opts.map(toVariant),
    })),
    specs: toSpecs(p),
    reviews: toReviews(p),
    tags: p.tags,
    createdAt: p.createdAt,
    popularity: p.popularity,
  }
}

export function toCartItem(item: ApiCartItem): CartItem {
  return {
    productId: item.productId,
    slug: item.slug,
    name: item.name,
    image: item.image ?? "/placeholder.svg",
    price: item.price,
    originalPrice: item.originalPrice ?? item.price,
    variant: item.variantLabel,
    quantity: item.quantity,
    stockStatus: stockStatus(item.stock),
  }
}

export function toWishlistItems(items: ApiWishlistItem[]): { id: string; slug: string; name: string; image: string; price: number }[] {
  return items.map((i) => ({
    id: i.productId,
    slug: i.product.slug,
    name: i.product.name,
    image: i.product.images?.[0]?.url ?? "/placeholder.svg",
    price: Number(i.product.price),
  }))
}

export function catalogToCart(cart: ApiCart): CartItem[] {
  return cart.items.map(toCartItem)
}

export { toCartItem as toCartLine }