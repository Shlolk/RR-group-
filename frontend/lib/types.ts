// Shared domain types for the RR GROUP storefront.
// UI-only: these describe the shape of the mock data and are ready to be
// backed by a real API later without changing component contracts.

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock"

export interface ProductVariant {
  id: string
  label: string
  value: string
  available: boolean
}

export interface ProductReview {
  id: string
  author: string
  avatarInitials: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
}

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: string
  categorySlug: string
  brand: string
  sku: string
  shortDescription: string
  description: string
  images: string[]
  price: number
  originalPrice: number
  rating: number
  reviewCount: number
  stock: number
  stockStatus: StockStatus
  badge?: "new" | "bestseller" | "sale"
  variants?: { name: string; options: ProductVariant[] }[]
  specs: ProductSpec[]
  reviews: ProductReview[]
  tags: string[]
  createdAt: string
  popularity: number
}

export interface Category {
  slug: string
  name: string
  description: string
  image: string
  productCount: number
}

export interface CartItem {
  productId: string
  slug: string
  name: string
  image: string
  price: number
  originalPrice: number
  variant?: string
  quantity: number
  stockStatus: StockStatus
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled"

export type PaymentStatus = "paid" | "pending" | "refunded" | "failed"

export interface OrderLine {
  name: string
  image: string
  variant?: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  date: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  items: OrderLine[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    name: string
    line1: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
  }
  timeline: { status: OrderStatus; label: string; date: string; done: boolean }[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
  quickActions?: string[]
}
