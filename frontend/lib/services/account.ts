import { api } from "@/lib/api"
import type {
  ApiAddress,
  ApiCart,
  ApiCustomer,
  ApiInvoice,
  ApiNotification,
  ApiOrder,
  ApiPayment,
  ApiTicket,
  ApiUser,
  ApiWishlist,
  Paginated,
} from "@/lib/api-types"

// ============ CART ============
export function fetchCart() {
  return api.get<ApiCart>("/api/cart")
}

export function addToServerCart(data: { productId: string; variantId?: string; quantity: number }) {
  return api.post<ApiCart>("/api/cart", data)
}

export function updateServerCartItem(itemId: string, quantity: number) {
  return api.patch<ApiCart>(`/api/cart/items/${itemId}`, { quantity })
}

export function removeServerCartItem(itemId: string) {
  return api.del<ApiCart>(`/api/cart/items/${itemId}`)
}

export function clearServerCart() {
  return api.del<ApiCart>("/api/cart")
}

// ============ WISHLIST ============
export function fetchWishlist() {
  return api.get<ApiWishlist>("/api/wishlist")
}

export function toggleServerWishlist(productId: string) {
  return api.post<{ added: boolean }>(`/api/wishlist/${productId}`)
}

// ============ ORDERS ============
export function fetchOrders(params?: { page?: number; perPage?: number }) {
  return api.get<Paginated<ApiOrder>>("/api/orders", params)
}

export function fetchOrder(id: string) {
  return api.get<ApiOrder>(`/api/orders/${id}`)
}

export function fetchOrderByNumber(orderNumber: string) {
  return api.get<ApiOrder>(`/api/orders/number/${orderNumber}`)
}

export function cancelOrder(id: string, reason?: string) {
  return api.post<ApiOrder>(`/api/orders/${id}/cancel`, { reason })
}

export function createCheckout(data: {
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
}) {
  return api.post<ApiOrder>("/api/checkout", data)
}

export function createPayment(
  orderId: string,
  data: { provider: "razorpay" | "stripe" },
) {
  return api.post<
    | {
        orderId: string
        razorpay: {
          orderId: string
          amountInPaise: number
          keyId: string
          currency: string
          notes: Record<string, string>
        }
      }
    | { clientSecret: string; publishableKey: string }
  >(`/api/orders/${orderId}/payment`, data)
}

export function verifyPayment(data: {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}) {
  return api.post<ApiOrder>("/api/payments/verify", data)
}

// ============ INVOICES & PAYMENTS ============
export function fetchInvoices(params?: { page?: number; perPage?: number }) {
  return api.get<Paginated<ApiInvoice>>("/api/invoices", params)
}

export function fetchInvoice(id: string) {
  return api.get<ApiInvoice>(`/api/invoices/${id}`)
}

export function fetchMyPayments() {
  return api.get<{ items: ApiPayment[] }>("/api/payments")
}

// ============ ADDRESSES ============
export function fetchAddresses() {
  return api.get<ApiAddress[]>("/api/account/addresses")
}

export function createAddress(data: {
  label?: string
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}) {
  return api.post<ApiAddress>("/api/account/addresses", data)
}

export function updateAddress(id: string, data: Partial<ApiAddress>) {
  return api.patch<ApiAddress>(`/api/account/addresses/${id}`, data)
}

export function deleteAddress(id: string) {
  return api.del<{ ok: boolean }>(`/api/account/addresses/${id}`)
}

// ============ CUSTOMER PROFILE ============
export function fetchCustomerProfile() {
  return api.get<ApiCustomer>("/api/account/profile/customer")
}

export function updateProfile(data: { firstName?: string; lastName?: string; phone?: string }) {
  return api.patch<ApiUser>("/api/account/profile", data)
}

// ============ NOTIFICATIONS ============
export function fetchMyNotifications() {
  return api.get<{ items: ApiNotification[] }>("/api/account/notifications")
}

export function markNotificationRead(id: string) {
  return api.patch<ApiNotification>(`/api/account/notifications/${id}/read`)
}

// ============ SUPPORT TICKETS ============
export function fetchMyTickets() {
  return api.get<ApiTicket[]>("/api/account/support")
}

export function fetchMyTicket(id: string) {
  return api.get<ApiTicket>(`/api/account/support/${id}`)
}

export function createTicket(data: { subject: string; description: string; priority?: string; orderId?: string }) {
  return api.post<ApiTicket>("/api/account/support", data)
}

export function replyTicket(id: string, content: string) {
  return api.post<{ id: string; content: string; createdAt: string }>(`/api/account/support/${id}/reply`, {
    content,
  })
}

// ============ MESSAGES ============
export function fetchMyMessages() {
  return api.get<Array<{ id: string; subject: string; content: string; createdAt: string }>>("/api/account/messages")
}