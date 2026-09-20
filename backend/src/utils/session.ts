import { createHash } from "crypto"
import { env } from "@/config/env"
import jwt from "jsonwebtoken"
import { AppError } from "@/utils/api"
import { findById, getDb } from "@/services/db/firestore"

export interface SessionPayload {
  userId: string
  role: string
}

export function signAccessToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_MAX_AGE,
  })
}

export function verifyAccessToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload
    return { userId: decoded.userId, role: decoded.role }
  } catch {
    return null
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string, role = "") {
  const token = signAccessToken({ userId, role })
  const expiresAt = new Date(Date.now() + env.ACCESS_TOKEN_MAX_AGE * 1000)
  await getDb()
    .collection("sessions")
    .doc(hashToken(token))
    .set({
      userId,
      userAgent,
      ipAddress,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    })
  return { token, expiresAt }
}

export async function invalidateSession(token: string) {
  await getDb()
    .collection("sessions")
    .doc(hashToken(token))
    .delete()
    .catch(() => undefined)
}

export async function validateSession(token: string): Promise<(SessionPayload & { email: string }) | null> {
  const payload = verifyAccessToken(token)
  if (!payload) return null

  const user = await findById<{
    id: string
    email: string
    role: string
    isActive: boolean
  }>("users", payload.userId)
  if (!user || !user.isActive) return null

  const session = await getDb()
    .collection("sessions")
    .doc(hashToken(token))
    .get()
    .then((snap) => (snap.exists ? snap.data() : null))
  if (!session) return null
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) return null

  return { userId: user.id, role: user.role, email: user.email }
}

export async function expireOldSessions(userId: string, keepLast = 5) {
  try {
    const snap = await getDb()
      .collection("sessions")
      .where("userId", "==", userId)
      .limit(100)
      .get()
    const docs = snap.docs
      .map((d) => ({ ref: d.ref, createdAt: d.data().createdAt ?? "" }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (docs.length <= keepLast) return
    const toDelete = docs.slice(keepLast).map((d) => d.ref)
    await Promise.all(toDelete.map((d) => d.delete()))
  } catch (err) {
    if (err instanceof AppError) throw err
    console.error("expireOldSessions:", err)
  }
}