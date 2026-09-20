import { api } from "@/lib/api"
import type { ApiUser, ApiProduct, ApiCategory, ApiCart, Paginated } from "@/lib/api-types"

// Auth
export function registerUser(data: {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}) {
  return api.post<ApiUser>("/api/auth/register", data)
}

export function loginUser(data: { email: string; password: string }) {
  return api.post<ApiUser>("/api/auth/login", data)
}

export function logoutUser() {
  return api.post<{ ok: boolean }>("/api/auth/logout")
}

export function firebaseLogin(idToken: string) {
  return api.post<ApiUser>("/api/auth/firebase-login", { idToken })
}

export function getCurrentUser() {
  return api.get<ApiUser>("/api/auth/me")
}

export function forgotPassword(email: string) {
  return api.post<null>("/api/auth/forgot-password", { email })
}

export function resetPassword(token: string, password: string) {
  return api.post<null>("/api/auth/reset-password", { token, password })
}

// Catalog (public)
export function fetchProducts(params?: {
  page?: number
  perPage?: number
  category?: string
  search?: string
  sort?: string
  inStock?: boolean
  featured?: boolean
}) {
  return api.get<Paginated<ApiProduct>>("/api/catalog/products", params)
}

export function searchProducts(q: string) {
  return api.get<{ items: ApiProduct[] }>("/api/catalog/products/search", { q })
}

export function fetchProductBySlug(slug: string) {
  return api.get<{ product: ApiProduct; related: ApiProduct[] }>(`/api/catalog/products/${slug}`)
}

export function fetchCategories() {
  return api.get<{ items: ApiCategory[] }>("/api/catalog/categories")
}

// Public content
export function fetchServices() {
  return api.get<unknown[]>("/api/public/services")
}

export function fetchJobOpenings() {
  return api.get<
    {
      id?: string
      slug?: string
      title: string
      category?: string
      type?: string
      location?: string
      experience?: string
      description?: string
      responsibilities?: string[]
      requirements?: string[]
      salaryRange?: string
      postedAt?: string
    }[]
  >("/api/public/jobs")
}

export async function submitJobApplication(data: {
  fullName: string
  email: string
  phone: string
  location: string
  position: string
  experience: string
  portfolio?: string
  github?: string
  coverLetter?: string
}) {
  return api.post("/api/public/applications", data)
}

export function fetchFaqs() {
  return api.get<{ id: string; question: string; answer: string }[]>("/api/public/faqs")
}

export function fetchTestimonials() {
  return api.get<unknown[]>("/api/public/testimonials")
}

export function fetchBlogPosts() {
  return api.get<unknown[]>("/api/public/blog")
}

export function fetchPortfolio() {
  return api.get<unknown[]>("/api/public/portfolio")
}

export function submitContact(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  return api.post("/api/public/contact", data)
}

export function subscribeNewsletter(email: string) {
  return api.post("/api/public/newsletter", { email })
}

// Chat assistant
export function sendChatMessage(data: {
  message: string
  history?: { role: "user" | "assistant"; content: string }[]
}) {
  return api.post<{ message: string; toolResults?: unknown[] }>("/api/chat/chat", data)
}