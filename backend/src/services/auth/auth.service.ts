import { createHash } from "crypto"
import { createSession, hashToken, invalidateSession } from "@/utils/session"
import { env } from "@/config/env"
import { getAdminAuth } from "@/config/firebase"
import { AppError } from "@/utils/api"
import { hashPassword, verifyPassword, generateRandomToken } from "@/utils/password"
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/emails/templates"
import { COLLECTIONS, findById, findMany, getDb, update } from "@/services/db/firestore"

export interface AuthUserShape {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  avatar?: string | null
  role: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function findUserByEmail(email: string) {
  const users = await findMany<{ id: string }>(COLLECTIONS.users, {
    where: [{ field: "email", op: "==", value: normalizeEmail(email) }],
    limit: 1,
  })
  if (!users.length) return null
  return findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, users[0].id)
}

export async function register(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}) {
  const email = normalizeEmail(input.email)
  const role = input.role ?? "CUSTOMER"

  const existing = await findUserByEmail(email)
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists")
  }

  const passwordHash = await hashPassword(input.password)
  let uid = ""

  const adminAuth = getAdminAuth()
  if (adminAuth) {
    try {
      const record = await adminAuth.createUser({
        email,
        password: input.password,
        displayName: `${input.firstName} ${input.lastName}`.trim(),
      })
      uid = record.uid
      await adminAuth.setCustomUserClaims(uid, { role })
    } catch (err) {
      if ((err as { code?: string }).code === "auth/email-already-exists") {
        throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists")
      }
      throw err
    }
  } else {
    uid = `local_${createHash("sha256").update(email).digest("hex").slice(0, 16)}`
  }

  const profile = {
    id: uid,
    email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone ?? null,
    avatar: null,
    role,
    permissions: [] as string[],
    emailVerified: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await getDb().collection(COLLECTIONS.users).doc(uid).set(profile)

  if (role === "CUSTOMER") {
    await getDb().collection(COLLECTIONS.customers).doc(uid).set({
      userId: uid,
      company: null,
      gstNumber: null,
      taxId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  sendWelcomeEmail(email, input.firstName)

  return {
    id: uid,
    email,
    firstName: input.firstName,
    lastName: input.lastName,
    role,
  }
}

export async function login(
  input: { email: string; password: string },
  userAgent?: string,
  ipAddress?: string,
) {
  const user = await findUserByEmail(input.email)
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
  }
  if (user.isActive === false) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled")
  }

  const valid = await verifyPassword(input.password, String(user.passwordHash ?? ""))
  if (!valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
  }

  const { token } = await createSession(user.id, userAgent, ipAddress, String(user.role ?? "CUSTOMER"))

  await update(COLLECTIONS.users, user.id, { lastLoginAt: new Date().toISOString() })

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar ?? null,
    },
    token,
  }
}

export async function loginWithIdToken(
  idToken: string,
  userAgent?: string,
  ipAddress?: string,
) {
  const adminAuth = getAdminAuth()
  if (!adminAuth) {
    throw new AppError(503, "FIREBASE_UNAVAILABLE", "Firebase Auth is not configured")
  }
  let decoded: { uid: string; email?: string; name?: string; email_verified?: boolean; role?: string }
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "Invalid or expired authentication token")
  }
  const uid = decoded.uid

  let user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, uid)
  if (!user) {
    const role = (decoded.role as string) ?? "CUSTOMER"
    user = {
      id: uid,
      email: decoded.email ?? "",
      passwordHash: null,
      firstName: decoded.name?.split(" ")[0] ?? (decoded.email ?? "").split("@")[0],
      lastName: decoded.name?.split(" ").slice(1).join(" ") ?? "",
      role,
      permissions: [],
      emailVerified: Boolean(decoded.email_verified),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await getDb().collection(COLLECTIONS.users).doc(uid).set(user)
    if (role === "CUSTOMER") {
      await getDb().collection(COLLECTIONS.customers).doc(uid).set({
        userId: uid,
        company: null,
        gstNumber: null,
        taxId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  if (user.isActive === false) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled")
  }

  const { token } = await createSession(uid, userAgent, ipAddress, String((user as Record<string, unknown>).role ?? "CUSTOMER"))
  await update(COLLECTIONS.users, uid, { lastLoginAt: new Date().toISOString() })

  return {
    user: {
      id: uid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar ?? null,
    },
    token,
  }
}

export async function logout(token?: string) {
  if (token) {
    await invalidateSession(token)
  }
}

export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email)
  if (!user) {
    return
  }

  const adminAuth = getAdminAuth()
  if (adminAuth) {
    const link = await adminAuth.generatePasswordResetLink(normalizeEmail(email))
    sendPasswordResetEmail(normalizeEmail(email), link)
    return
  }

  const token = generateRandomToken()
  const expiresAt = new Date(Date.now() + env.RESET_PASSWORD_TOKEN_MAX_AGE * 1000)
  await getDb()
    .collection(COLLECTIONS.passwordResetTokens)
    .doc(hashToken(token))
    .set({
      userId: user.id,
      token,
      usedAt: null,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    })

  sendPasswordResetEmail(normalizeEmail(email), token)
}

export async function resetPassword(token: string, newPassword: string) {
  const resetDoc = await getDb()
    .collection(COLLECTIONS.passwordResetTokens)
    .doc(hashToken(token))
    .get()
    .then((snap) => (snap.exists ? snap.data() : null))
  if (!resetDoc || resetDoc.usedAt) {
    throw new AppError(400, "INVALID_TOKEN", "This reset link is invalid or has already been used")
  }
  if (resetDoc.expiresAt && new Date(resetDoc.expiresAt) < new Date()) {
    throw new AppError(400, "TOKEN_EXPIRED", "This reset link has expired")
  }

  const userId = String(resetDoc.userId)
  const passwordHash = await hashPassword(newPassword)
  await update(COLLECTIONS.users, userId, { passwordHash })

  const adminAuth = getAdminAuth()
  if (adminAuth) {
    await adminAuth.updateUser(userId, { password: newPassword }).catch(() => undefined)
  }

  await getDb().collection(COLLECTIONS.passwordResetTokens).doc(hashToken(token)).update({
    usedAt: new Date().toISOString(),
  })

  const sessions = await getDb().collection("sessions").where("userId", "==", userId).limit(100).get()
  await Promise.all(sessions.docs.map((d) => d.ref.delete()))
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, userId)
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found")
  }

  const valid = await verifyPassword(currentPassword, String(user.passwordHash ?? ""))
  if (!valid) {
    throw new AppError(400, "INVALID_PASSWORD", "Current password is incorrect")
  }

  const passwordHash = await hashPassword(newPassword)
  await update(COLLECTIONS.users, userId, { passwordHash })

  const adminAuth = getAdminAuth()
  if (adminAuth) {
    await adminAuth.updateUser(userId, { password: newPassword }).catch(() => undefined)
  }
}

export async function me(userId: string) {
  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, userId)
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found")
  }

  let customer: Record<string, unknown> | null = null
  const customerSnap = await getDb().collection(COLLECTIONS.customers).doc(userId).get()
  if (customerSnap.exists) {
    customer = { id: customerSnap.id, ...customerSnap.data() }
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
    permissions: user.permissions ?? [],
    emailVerified: Boolean(user.emailVerified),
    isActive: user.isActive ?? true,
    createdAt: user.createdAt ?? null,
    customer: customer
      ? {
          id: customer.id,
          company: customer.company ?? null,
          gstNumber: customer.gstNumber ?? null,
          taxId: customer.taxId ?? null,
        }
      : null,
  }
}