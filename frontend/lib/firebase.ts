// Firebase client SDK — lazy singleton.
//
// The app falls back to mock/REST data until Firebase env vars are present,
// so the storefront keeps working without a Firebase project configured.
// Public client config values are safe to expose per Firebase's model; never
// put service-account secrets here.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/** True when a Firebase project has been configured via env vars. */
export const isFirebaseConfigured = Boolean(
  clientConfig.apiKey && clientConfig.authDomain && clientConfig.projectId,
)

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars (see .env.example).",
    )
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(clientConfig as Record<string, string>)
  }
  return app
}

let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp())
  return auth
}

export function getFirestoreDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp())
  return storage
}