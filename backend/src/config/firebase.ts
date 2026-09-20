import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getStorage, type Storage } from "firebase-admin/storage"

const projectId = process.env.FIREBASE_PROJECT_ID ?? ""
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? ""
const privateKey = process.env.FIREBASE_PRIVATE_KEY ?? ""

// Allow using a service-account JSON path as an alternative to inline env vars.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? ""

export const isFirebaseConfigured = Boolean(
  (process.env.GOOGLE_APPLICATION_CREDENTIALS || serviceAccountPath) ||
    (clientEmail && privateKey && projectId),
)

function firebaseAdmin() {
  const existing = getApps()[0]
  if (existing) return existing

  let options: Parameters<typeof initializeApp>[0]
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || serviceAccountPath) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    options = { credential: cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? serviceAccountPath)) }
  } else {
    options = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    }
  }
  return initializeApp(options)
}

export function getAdminAuth(): Auth | null {
  if (!isFirebaseConfigured) return null
  return getAuth(firebaseAdmin())
}

export function getAdminDb(): Firestore | null {
  if (!isFirebaseConfigured) return null
  return getFirestore(firebaseAdmin())
}

export function getAdminStorage(): Storage | null {
  if (!isFirebaseConfigured) return null
  return getStorage(firebaseAdmin())
}