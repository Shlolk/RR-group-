import { COLLECTIONS, getDb } from "@/services/db/firestore"

export interface AuditEntry {
  actorId?: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export async function createAuditLog(entry: AuditEntry) {
  try {
    await getDb().collection(COLLECTIONS.auditLogs).add({
      actorId: entry.actorId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
      ipAddress: entry.ipAddress ?? null,
      createdAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Failed to write audit log:", err)
  }
}

export async function loginAudit(userId: string, ipAddress?: string) {
  await createAuditLog({ actorId: userId, action: "LOGIN", entity: "User", entityId: userId, ipAddress })
}

export async function logoutAudit(userId: string, ipAddress?: string) {
  await createAuditLog({ actorId: userId, action: "LOGOUT", entity: "User", entityId: userId, ipAddress })
}

export async function productAudit(actorId: string, action: string, productId: string, metadata?: Record<string, unknown>) {
  await createAuditLog({ actorId, action, entity: "Product", entityId: productId, metadata })
}

export async function orderAudit(actorId: string, action: string, orderId: string, metadata?: Record<string, unknown>) {
  await createAuditLog({ actorId, action, entity: "Order", entityId: orderId, metadata })
}

export async function inventoryAudit(actorId: string, action: string, productId: string, metadata?: Record<string, unknown>) {
  await createAuditLog({ actorId, action, entity: "Product", entityId: productId, metadata })
}

export async function userAudit(actorId: string, action: string, userId: string, metadata?: Record<string, unknown>) {
  await createAuditLog({ actorId, action, entity: "User", entityId: userId, metadata })
}

export async function settingsAudit(actorId: string, action: string, metadata?: Record<string, unknown>) {
  await createAuditLog({ actorId, action, entity: "Settings", metadata })
}