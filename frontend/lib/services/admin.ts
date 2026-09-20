import { api } from "@/lib/api"
import type {
  ApiDashboardStats,
  ApiInvoice,
  ApiLead,
  ApiOrder,
  ApiPayment,
  ApiProduct,
  ApiRefund,
  ApiTicket,
  ApiUser,
  Paginated,
} from "@/lib/api-types"

// ============ DASHBOARD ============
export function fetchDashboard() {
  return api.get<ApiDashboardStats>("/api/admin/dashboard")
}

// ============ USERS & CUSTOMERS ============
export function fetchUsers(params?: { page?: number; perPage?: number; search?: string }) {
  return api.get<Paginated<ApiUser>>("/api/admin/users", params)
}

export function fetchUser(id: string) {
  return api.get<ApiUser>(`/api/admin/users/${id}`)
}

export function createUser(data: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  permissions?: string[]
}) {
  return api.post<ApiUser>("/api/admin/users", data)
}

export function updateUser(id: string, data: Partial<ApiUser>) {
  return api.patch<ApiUser>(`/api/admin/users/${id}`, data)
}

export function changeUserRole(id: string, role: string) {
  return api.patch<ApiUser>(`/api/admin/users/${id}/role`, { role })
}

export function toggleUserStatus(id: string) {
  return api.patch<ApiUser>(`/api/admin/users/${id}/status`)
}

export function fetchCustomers(params?: { page?: number; perPage?: number; search?: string }) {
  return api.get<Paginated<unknown>>("/api/admin/customers", params)
}

// ============ PRODUCTS & CATEGORIES (ADMIN) ============
export function fetchAdminProducts(params?: { page?: number; perPage?: number; search?: string }) {
  return api.get<{ items: ApiProduct[]; total: number }>("/api/admin/admin-products", params)
}

export function createAdminProduct(data: Record<string, unknown>) {
  return api.post<ApiProduct>("/api/admin/products", data)
}

export function updateAdminProduct(id: string, data: Record<string, unknown>) {
  return api.put<ApiProduct>(`/api/admin/products/${id}`, data)
}

export function deleteAdminProduct(id: string) {
  return api.del<{ ok: boolean }>(`/api/admin/products/${id}`)
}

export function adjustInventory(id: string, data: { type: string; quantity: number; note?: string }) {
  return api.post<{ ok: boolean }>(`/api/admin/products/${id}/inventory`, data)
}

// ============ ORDERS, REFUNDS, PAYMENTS, INVOICES (ADMIN) ============
export function fetchAdminOrders(params?: { page?: number; perPage?: number; status?: string }) {
  return api.get<Paginated<ApiOrder>>("/api/admin/orders", params)
}
export function fetchAdminOrder(id: string) {
  return api.get<ApiOrder>(`/api/admin/orders/${id}`)
}
export function updateAdminOrderStatus(id: string, status: string, note?: string) {
  return api.patch<ApiOrder>(`/api/admin/orders/${id}/status`, { status, note })
}
export function createAdminRefund(orderId: string, data: { amount: number; reason?: string }) {
  return api.post<ApiRefund>(`/api/admin/orders/${orderId}/refund`, data)
}
export function fetchAdminRefunds() {
  return api.get<ApiRefund[]>("/api/admin/refunds")
}
export function fetchAdminPayments() {
  return api.get<ApiPayment[]>("/api/admin/payments")
}
export function fetchAdminInvoices() {
  return api.get<Paginated<ApiInvoice>>("/api/admin/invoices")
}
export function createAdminInvoice(data: Record<string, unknown>) {
  return api.post<ApiInvoice>("/api/admin/invoices", data)
}

// ============ CRM LEADS ============
export function fetchLeads(params?: { page?: number; perPage?: number; status?: string }) {
  return api.get<Paginated<ApiLead>>("/api/admin/leads", params)
}
export function fetchLead(id: string) {
  return api.get<ApiLead>(`/api/admin/leads/${id}`)
}
export function createLead(data: Record<string, unknown>) {
  return api.post<ApiLead>("/api/admin/leads", data)
}
export function updateLead(id: string, data: Record<string, unknown>) {
  return api.patch<ApiLead>(`/api/admin/leads/${id}`, data)
}
export function deleteLead(id: string) {
  return api.del<{ ok: boolean }>(`/api/admin/leads/${id}`)
}

// ============ ERP ============
export function fetchDepartments() {
  return api.get<Paginated<unknown>>("/api/admin/erp/departments")
}
export function createDepartment(data: { name: string; headUserId?: string }) {
  return api.post("/api/admin/erp/departments", data)
}
export function fetchEmployees() {
  return api.get<Paginated<unknown>>("/api/admin/erp/employees")
}
export function createEmployee(data: Record<string, unknown>) {
  return api.post("/api/admin/erp/employees", data)
}
export function updateEmployee(id: string, data: Record<string, unknown>) {
  return api.patch(`/api/admin/erp/employees/${id}`, data)
}

// ============ MARKETING ============
export function fetchCampaigns() {
  return api.get<Paginated<unknown>>("/api/admin/campaigns")
}
export function createCampaign(data: Record<string, unknown>) {
  return api.post("/api/admin/campaigns", data)
}
export function updateCampaign(id: string, data: Record<string, unknown>) {
  return api.patch(`/api/admin/campaigns/${id}`, data)
}
export function fetchCampaignAnalytics(id: string) {
  return api.get(`/api/admin/campaigns/${id}/analytics`)
}

// ============ SUPPORT (ADMIN) ============
export function fetchAdminTickets(params?: { page?: number; status?: string }) {
  return api.get<Paginated<ApiTicket>>("/api/admin/tickets", params)
}
export function fetchAdminTicket(id: string) {
  return api.get<ApiTicket>(`/api/admin/tickets/${id}`)
}
export function updateAdminTicket(id: string, data: { status?: string; priority?: string; assignedTo?: string }) {
  return api.patch<ApiTicket>(`/api/admin/tickets/${id}`, data)
}
export function replyAdminTicket(id: string, data: { content: string; isInternal?: boolean }) {
  return api.post<ApiTicket>(`/api/admin/tickets/${id}/reply`, data)
}

// ============ CONTENT ============
export function fetchAdminBlogPosts() {
  return api.get<unknown[]>("/api/admin/blog")
}
export function createAdminBlogPost(data: Record<string, unknown>) {
  return api.post("/api/admin/blog", data)
}
export function updateAdminBlogPost(id: string, data: Record<string, unknown>) {
  return api.patch(`/api/admin/blog/${id}`, data)
}
export function deleteAdminBlogPost(id: string) {
  return api.del(`/api/admin/blog/${id}`)
}
export function fetchAdminFaqs() {
  return api.get<unknown[]>("/api/admin/faq")
}
export function createAdminFaq(data: Record<string, unknown>) {
  return api.post("/api/admin/faq", data)
}
export function updateAdminFaq(id: string, data: Record<string, unknown>) {
  return api.patch(`/api/admin/faq/${id}`, data)
}
export function deleteAdminFaq(id: string) {
  return api.del(`/api/admin/faq/${id}`)
}
export function fetchAdminTestimonials() {
  return api.get<unknown[]>("/api/admin/testimonials")
}
export function createAdminTestimonial(data: Record<string, unknown>) {
  return api.post("/api/admin/testimonials", data)
}
export function deleteAdminTestimonial(id: string) {
  return api.del(`/api/admin/testimonials/${id}`)
}

// ============ NOTIFICATIONS & AUDIT (ADMIN) ============
export function fetchNotifications(params?: { page?: number; perPage?: number }) {
  return api.get<unknown>("/api/admin/notifications", params as Record<string, string | number | boolean | undefined | null>)
}
export function broadcastNotification(data: Record<string, unknown>) {
  return api.post("/api/admin/notifications/broadcast", data)
}
export function fetchAuditLogs(params?: { page?: number; perPage?: number }) {
  return api.get<Paginated<unknown>>("/api/admin/audit-logs", params)
}
export function fetchInquiries() {
  return api.get<unknown[]>("/api/admin/inquiries")
}
export function updateInquiry(id: string, data: { status?: string }) {
  return api.patch(`/api/admin/inquiries/${id}`, data)
}

// ============ PORTFOLIO, SERVICES, JOBS, APPLICATIONS (ADMIN) ============
export function fetchAdminPortfolio() {
  return api.get<unknown[]>("/api/admin/portfolio")
}
export function fetchAdminServices() {
  return api.get<unknown[]>("/api/admin/services")
}
export function fetchAdminJobs() {
  return api.get<unknown[]>("/api/admin/jobs")
}
export function fetchAdminApplications() {
  return api.get<unknown[]>("/api/admin/applications")
}
export function updateApplication(id: string, data: Record<string, unknown>) {
  return api.patch(`/api/admin/applications/${id}`, data)
}

// ============ CATEGORIES & COUPONS (ADMIN) ============
export function fetchAdminCategories() {
  return api.get<unknown[]>("/api/admin/categories")
}
export function fetchAdminCoupons() {
  return api.get<unknown[]>("/api/admin/coupons")
}

// ============ NEWSLETTER (ADMIN) ============
export function fetchNewsletterSubscribers() {
  return api.get<unknown[]>("/api/admin/newsletter")
}
export function fetchSubscribersFallback() {
  return api.get<unknown[]>("/api/admin/subscribers")
}
export function fetchReviews() {
  return api.get<unknown[]>("/api/admin/reviews")
}
export function approveReview(id: string) {
  return api.patch(`/api/admin/reviews/${id}/approve`)
}
export function deleteReview(id: string) {
  return api.del(`/api/admin/reviews/${id}`)
}

// ============ CHAT ============
export function chatWithAssistant(data: { message: string; history?: { role: "user" | "assistant"; content: string }[] }) {
  return api.post<{ message: string; toolResults: unknown[] }>("/api/chat/chat", data)
}