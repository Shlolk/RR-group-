// Reusable Firebase data-service module.
//
// All Firestore reads/writes go through these thin wrappers so components
// never scatter raw SDK calls. When Firebase is not configured these fall
// back to the legacy REST backend (or throw a typed error which callers
// handle via existing mock fallbacks).

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  type QueryConstraint,
} from "firebase/firestore"
import { getFirestoreDb, getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  onAuthStateChanged,
  getIdToken,
  type User as FirebaseUser,
} from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"

export { isFirebaseConfigured }

// ---------------------------------------------------------------------------
// Collections (Firestore layout — keep in sync with firestore.rules)
// ---------------------------------------------------------------------------
export const COLLECTIONS = {
  users: "users",
  customers: "customers",
  roles: "roles",
  services: "services",
  serviceRequests: "serviceRequests",
  projects: "projects",
  portfolioProjects: "portfolioProjects",
  leads: "leads",
  contactInquiries: "contactInquiries",
  products: "products",
  categories: "categories",
  carts: "carts",
  wishlists: "wishlists",
  addresses: "addresses",
  orders: "orders",
  payments: "payments",
  refunds: "refunds",
  coupons: "coupons",
  invoices: "invoices",
  supportTickets: "supportTickets",
  messages: "messages",
  notifications: "notifications",
  blogPosts: "blogPosts",
  faqs: "faqs",
  testimonials: "testimonials",
  campaigns: "campaigns",
  careerApplications: "careerApplications",
  departments: "departments",
  employees: "employees",
  auditLogs: "auditLogs",
  newsletterSubscribers: "newsletterSubscribers",
} as const

// ---------------------------------------------------------------------------
// Generic Firestore helpers
// ---------------------------------------------------------------------------
export async function getById<T>(coll: string, id: string): Promise<T | null> {
  const db = getFirestoreDb()
  const snap = await getDoc(doc(db, coll, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}

export async function queryWhere<T>(
  coll: string,
  field: string,
  operator: "==" | "!=" | ">" | ">=" | "<" | "<=" | "array-contains",
  value: unknown,
  max = 100,
): Promise<T[]> {
  const db = getFirestoreDb()
  const q = query(
    collection(db, coll),
    where(field, operator, value),
    limit(max) as unknown as QueryConstraint,
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))
}

// ---------------------------------------------------------------------------
// Auth (Firebase Auth client)
// ---------------------------------------------------------------------------
export function onAuthChange(cb: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), cb)
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password)
}

/** Resolve a fresh idToken for the signed-in Firebase user (null when signed out). */
export async function getFirebaseIdToken(): Promise<string | null> {
  const current = getFirebaseAuth().currentUser
  if (!current) return null
  return getIdToken(current)
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(getFirebaseAuth(), email)
}

export async function resetPassword(code: string, newPassword: string) {
  return confirmPasswordReset(getFirebaseAuth(), code, newPassword)
}

export async function signOutFirebase() {
  return signOut(getFirebaseAuth())
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
export async function uploadToStorage(
  path: string,
  blob: Blob | Uint8Array | ArrayBuffer,
  contentType: string,
): Promise<string> {
  const storage = getStorage(getFirebaseApp())
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, blob, { contentType })
  return getDownloadURL(fileRef)
}

export async function deleteFromStorage(path: string) {
  const storage = getStorage(getFirebaseApp())
  await deleteObject(ref(storage, path))
}