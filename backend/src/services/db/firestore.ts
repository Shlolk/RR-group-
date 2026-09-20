import { FieldValue, type CollectionReference, type Firestore, type Query } from "firebase-admin/firestore"
import { getAdminDb, isFirebaseConfigured } from "@/config/firebase"
import { AppError } from "@/utils/api"

export const COLLECTIONS = {
  users: "users",
  customers: "customers",
  roles: "roles",
  sessions: "sessions",
  products: "products",
  categories: "categories",
  carts: "carts",
  wishlists: "wishlists",
  orders: "orders",
  payments: "payments",
  refunds: "refunds",
  invoices: "invoices",
  addresses: "addresses",
  reviews: "reviews",
  inventoryMovements: "inventoryMovements",
  leads: "leads",
  departments: "departments",
  employees: "employees",
  supportTickets: "supportTickets",
  messages: "messages",
  notifications: "notifications",
  services: "services",
  serviceRequests: "serviceRequests",
  projects: "projects",
  blogPosts: "blogPosts",
  faqs: "faqs",
  testimonials: "testimonials",
  jobs: "jobs",
  careerApplications: "careerApplications",
  contactInquiries: "contactInquiries",
  newsletterSubscribers: "newsletterSubscribers",
  campaigns: "campaigns",
  coupons: "coupons",
  auditLogs: "auditLogs",
  chatConversations: "chatConversations",
  passwordResetTokens: "passwordResetTokens",
  couponsUsage: "couponUsage",
} as const

function db(): Firestore {
  if (!isFirebaseConfigured) {
    throw new AppError(503, "DATA_STORE_UNAVAILABLE", "Firebase is not configured on the server")
  }
  return getAdminDb()!
}

function col(collection: keyof typeof COLLECTIONS | string): CollectionReference {
  return db().collection(collection)
}

export interface FindOptions {
  where?: { field: string; op: "==" | "!=" | ">" | ">=" | "<" | "<=" | "array-contains" | "in"; value: unknown }[]
  orderBy?: { field: string; dir?: "asc" | "desc" }
  limit?: number
  offset?: number
}

export async function findById<T = Record<string, unknown>>(collection: string, id: string): Promise<T | null> {
  const snap = await col(collection).doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...(snap.data() as Record<string, unknown>) } as T
}

export async function findMany<T = Record<string, unknown>>(collection: string, options: FindOptions = {}): Promise<T[]> {
  let query: Query = col(collection)
  for (const w of options.where ?? []) {
    query = query.where(w.field, w.op, w.value)
  }
  if (options.orderBy) {
    query = query.orderBy(options.orderBy.field, options.orderBy.dir ?? "asc")
  }
  if (options.limit) query = query.limit(options.limit)
  const snap = await query.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export async function countWhere(collection: string, field: string, op: "==" | "!=" | ">" | ">=" | "<" | "<=", value: unknown): Promise<number> {
  const snap = await col(collection).where(field, op, value).count().get()
  return snap.data().count
}

export async function create(collection: string, data: Record<string, unknown>): Promise<Record<string, unknown> & { id: string }> {
  const id = data.id as string | undefined
  const { id: _omit, ...rest } = data
  const doc = id ? col(collection).doc(id) : col(collection).doc()
  const values = rest as Record<string, unknown>
  const payload = {
    ...values,
    createdAt: values.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await doc.set(payload, { merge: false })
  return { id: doc.id, ...values } as Record<string, unknown> & { id: string }
}

export async function update(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
  await col(collection).doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function setDoc(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
  await col(collection).doc(id).set(data, { merge: true })
}

export async function remove(collection: string, id: string): Promise<void> {
  await col(collection).doc(id).delete()
}

export function now(): string {
  return new Date().toISOString()
}

export function increment(n: number) {
  return FieldValue.increment(n)
}

export function arrayUnion<T>(value: T) {
  return FieldValue.arrayUnion(value)
}

export function arrayRemove<T>(value: T) {
  return FieldValue.arrayRemove(value)
}

export { db as getDb }