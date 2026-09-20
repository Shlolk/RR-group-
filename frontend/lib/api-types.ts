// API contract types — mirror backend Prisma-shaped responses.

export interface ApiUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  avatar?: string | null
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER"
  emailVerified: boolean
  isActive: boolean
  createdAt?: string
  permissions?: string[]
}

export interface ApiCategory {
  id: string
  slug: string
  name: string
  description?: string | null
  image?: string | null
  active: boolean
  order: number
  parentId?: string | null
  _count?: { products: number }
}

export interface ApiProductImage {
  id: string
  url: string
  alt?: string | null
  position: number
}

export interface ApiProductVariant {
  id: string
  name: string
  value: string
  price?: string | number | null
  sku?: string | null
  stock: number
  available: boolean
}

export interface ApiReview {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  verified: boolean
  status: string
  createdAt: string
  user?: { id: string; firstName?: string | null; lastName?: string | null; avatar?: string | null } | null
}

export interface ApiProduct {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  description: string
  categoryId?: string | null
  category?: ApiCategory | null
  brand?: string | null
  sku: string
  price: string | number
  originalPrice?: string | number | null
  taxRate: string | number
  stock: number
  reservedStock: number
  lowStockThreshold: number
  isFeatured: boolean
  isActive: boolean
  isDigital: boolean
  tags: string[]
  rating: string | number
  reviewCount: number
  popularity: number
  createdAt: string
  images?: ApiProductImage[]
  variants?: ApiProductVariant[]
  attributes?: { id: string; name: string; value: string }[]
  reviews?: ApiReview[]
}

export interface ApiAddress {
  id: string
  label: string
  fullName: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string | null
  isDefault: boolean
}

export interface ApiOrderItem {
  id: string
  productId: string
  variantId?: string | null
  name: string
  sku?: string | null
  image?: string | null
  unitPrice: string | number
  quantity: number
  discount: string | number
  tax: string | number
  total: string | number
}

export interface ApiPayment {
  id: string
  orderId?: string | null
  amount: string | number
  currency: string
  method: string
  provider: string
  providerPaymentId?: string | null
  providerOrderId?: string | null
  status: string
  description?: string | null
  failureReason?: string | null
  createdAt: string
  order?: { orderNumber: string } | null
}

export interface ApiRefund {
  id: string
  paymentId: string
  orderId?: string | null
  amount: string | number
  reason?: string | null
  status: string
  createdAt: string
}

export interface ApiOrder {
  id: string
  orderNumber: string
  userId?: string
  status: string
  paymentStatus: string
  paymentMethod?: string | null
  subtotal: string | number
  discountAmount: string | number
  shippingCharge: string | number
  taxAmount: string | number
  total: string | number
  couponCode?: string | null
  currency: string
  notes?: string | null
  trackingNumber?: string | null
  expectedDelivery?: string | null
  cancelledAt?: string | null
  createdAt: string
  user?: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null
  customer?: { id: string; email?: string; company?: string | null } | null
  items?: ApiOrderItem[]
  statusHistory?: { id: string; status: string; note?: string | null; createdAt: string }[]
  payments?: ApiPayment[]
  invoice?: ApiInvoice | null
  refunds?: ApiRefund[]
  shippingAddress?: ApiAddress | null
  billingAddress?: ApiAddress | null
}

export interface ApiInvoice {
  id: string
  invoiceNumber: string
  orderId?: string | null
  status: string
  dueDate?: string | null
  subtotal: string | number
  discountAmount: string | number
  taxAmount: string | number
  total: string | number
  notes?: string | null
  paidAt?: string | null
  createdAt: string
  items?: { id: string; description: string; quantity: number; unitPrice: string | number; taxRate: string | number; total: string | number }[]
  order?: { orderNumber: string } | null
}

export interface ApiCartItem {
  id: string
  productId: string
  variantId?: string | null
  name: string
  slug: string
  sku?: string
  image?: string
  price: number
  originalPrice?: number | null
  variantLabel?: string
  variantName?: string
  quantity: number
  stock: number
  stockStatus: string
}

export interface ApiCart {
  id: string
  items: ApiCartItem[]
  subtotal: number
  itemCount: number
}

export interface ApiWishlistItem {
  id: string
  productId: string
  createdAt: string
  product: {
    id: string
    slug: string
    name: string
    price: string | number
    originalPrice?: string | number | null
    stock: number
    isActive: boolean
    images?: ApiProductImage[]
  }
}

export interface ApiWishlist {
  id: string
  items: ApiWishlistItem[]
}

export interface Paginated<T> {
  items: T[]
  pagination: { page: number; perPage: number; total: number; totalPages: number }
}

export interface ApiService {
  id: string
  slug: string
  name: string
  description: string
  category: string
  icon?: string | null
  image?: string | null
  features: string[]
  price: string | number
  currency: string
  duration?: string | null
  isActive: boolean
}

export interface ApiLead {
  id: string
  customerId?: string | null
  name: string
  email: string
  phone?: string | null
  company?: string | null
  source?: string | null
  status: string
  priority?: string | null
  value?: string | number | null
  notes?: string | null
  createdAt: string
  assignee?: { id: string; firstName?: string | null; lastName?: string | null } | null
}

export interface ApiTicket {
  id: string
  ticketNumber?: string
  subject: string
  description: string
  status: string
  priority: string
  orderId?: string | null
  createdAt: string
  user?: { firstName?: string | null; lastName?: string | null; email: string } | null
  messages?: {
    id: string
    senderId: string
    content: string
    isInternal: boolean
    createdAt: string
    sender?: { firstName?: string | null; lastName?: string | null; role?: string | null; avatar?: string | null } | null
  }[]
  _count?: { messages: number }
}

export interface ApiCustomer {
  id: string
  company?: string | null
  gstNumber?: string | null
  lifetimeValue?: string | number | null
  createdAt?: string
  user?: { email: string; firstName?: string; lastName?: string; phone?: string | null; avatar?: string | null }
  addresses?: ApiAddress[]
}

export interface ApiNotification {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  readAt?: string | null
  createdAt: string
}

export interface ApiDashboardStats {
  totals?: Record<string, number>
  revenue?: number
  ordersCount?: number
  customerCount?: number
  productCount?: number
  pendingOrders?: number
  lowStockCount?: number
  unreadMessages?: number
  openTickets?: number
  revenueSeries?: { date: string; revenue: number }[]
  topProducts?: { productId: string; name: string; quantity: number; revenue: number }[]
  paymentMethodStats?: { method: string; count: number; amount: number }[]
  pendingReviewCount?: number
  newInquiryCount?: number
  totalInquiries?: number
}