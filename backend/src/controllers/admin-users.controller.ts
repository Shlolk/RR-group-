import type { NextFunction, Request, Response } from "express"
import { success, paginate, AppError } from "@/utils/api"
import { createAuditLog } from "@/utils/audit"
import { hashPassword } from "@/utils/password"
import { getAdminAuth } from "@/config/firebase"
import * as authService from "@/services/auth/auth.service"
import { COLLECTIONS, findById, findMany, countWhere, update } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

export async function listUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(
      Number(req.query.page ?? 1),
      Number(req.query.perPage ?? 20),
    )
    const search = (req.query.search as string) ?? ""
    const role = (req.query.role as string) ?? ""

    const [roleDocs, users] = await Promise.all([
      findMany<Row>(COLLECTIONS.roles, { limit: 500 }),
      findMany<Row>(COLLECTIONS.users, {
        orderBy: { field: "createdAt", dir: "desc" },
        limit: 1000,
      }),
    ])
    const roleNameBySlug = new Map<string, string>()
    for (const r of roleDocs) {
      if (r.slug) roleNameBySlug.set(String(r.slug), r.name != null ? String(r.name) : String(r.slug))
    }

    const q = search.trim().toLowerCase()
    let filtered = users
    if (role) filtered = filtered.filter((u) => String(u.role ?? "") === role)
    if (q) {
      filtered = filtered.filter(
        (u) =>
          String(u.email ?? "").toLowerCase().includes(q) ||
          String(u.firstName ?? "").toLowerCase().includes(q) ||
          String(u.lastName ?? "").toLowerCase().includes(q),
      )
    }

    const total = filtered.length
    const pageRows = filtered.slice(skip, skip + take)

    const items = await Promise.all(
      pageRows.map(async (u) => {
        let customer: { id: string; company: string | null } | null = null
        const customerDoc = await findById(COLLECTIONS.customers, String(u.id))
        if (customerDoc) {
          customer = { id: String(customerDoc.id), company: (customerDoc.company as string | null) ?? null }
        }
        return {
          id: String(u.id),
          email: (u.email as string | null) ?? null,
          firstName: (u.firstName as string | null) ?? null,
          lastName: (u.lastName as string | null) ?? null,
          phone: (u.phone as string | null) ?? null,
          avatar: (u.avatar as string | null) ?? null,
          role: (u.role as string | null) ?? null,
          roleName: roleNameBySlug.get(String(u.role ?? "")) ?? null,
          isActive: (u.isActive as boolean) ?? true,
          emailVerified: (u.emailVerified as boolean) ?? false,
          lastLoginAt: (u.lastLoginAt as string | null) ?? null,
          createdAt: (u.createdAt as string | null) ?? null,
          customer,
        }
      }),
    )

    return success(res, {
      items,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (err) {
    next(err)
  }
}

export async function getUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findById<Row>(COLLECTIONS.users, req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found", code: "NOT_FOUND" })
    }
    const customer = await findById(COLLECTIONS.customers, req.params.id)
    const addresses = (await findMany<Row>(COLLECTIONS.addresses, {
      where: [{ field: "userId", op: "==", value: req.params.id }],
      limit: 500,
    })).sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)))
    const orders = (await findMany<Row>(COLLECTIONS.orders, {
      where: [{ field: "userId", op: "==", value: req.params.id }],
      limit: 20,
    })).sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const supportTickets = (await findMany<Row>(COLLECTIONS.supportTickets, {
      where: [{ field: "userId", op: "==", value: req.params.id }],
      limit: 20,
    })).sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const { passwordHash: _passwordHash, ...safe } = user
    return success(res, { ...safe, customer, addresses, orders, supportTickets }, "User fetched")
  } catch (err) {
    next(err)
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, phone, role, permissions } = req.body
    const created = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role ?? "STAFF",
    })
    if (Array.isArray(permissions) && permissions.length) {
      await update(COLLECTIONS.users, created.id, { permissions })
    }
    const full = await findById<Row>(COLLECTIONS.users, created.id)
    const payload = (full ?? { ...created }) as Record<string, unknown>
    const { passwordHash: _passwordHash, ...safe } = payload
    createAuditLog({ actorId: req.user!.id, action: "USER_CREATE", entity: "User", entityId: created.id })
    return success(res, safe, "User created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, ...rest } = req.body
    const data: Record<string, unknown> = { ...rest }
    if (password) {
      data.passwordHash = await hashPassword(password)
    }
    const existing = await findById<Row>(COLLECTIONS.users, req.params.id)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "User not found")
    }
    await update(COLLECTIONS.users, req.params.id, data)
    const updated = await findById<Row>(COLLECTIONS.users, req.params.id)
    const user = {
      id: updated?.id ?? req.params.id,
      email: (updated?.email as string) ?? (existing.email as string) ?? null,
      firstName: (updated?.firstName as string) ?? (existing.firstName as string) ?? null,
      lastName: (updated?.lastName as string) ?? (existing.lastName as string) ?? null,
      phone: (updated?.phone as string | null) ?? null,
      role: (updated?.role as string) ?? (existing.role as string) ?? null,
      permissions: Array.isArray(updated?.permissions)
        ? (updated.permissions as string[])
        : Array.isArray(existing.permissions)
          ? (existing.permissions as string[])
          : [],
      isActive: updated?.isActive != null ? Boolean(updated.isActive) : (existing.isActive as boolean) ?? true,
    }
    createAuditLog({ actorId: req.user!.id, action: "USER_UPDATE", entity: "User", entityId: user.id })
    return success(res, user, "User updated")
  } catch (err) {
    next(err)
  }
}

export async function changeUserRoleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body
    const validRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "CUSTOMER"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role", code: "VALIDATION_ERROR" })
    }
    const existing = await findById<Row>(COLLECTIONS.users, req.params.id)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "User not found")
    }
    await update(COLLECTIONS.users, req.params.id, { role })
    const adminAuth = getAdminAuth()
    if (adminAuth) {
      adminAuth.setCustomUserClaims(req.params.id, { role }).catch(() => undefined)
    }
    createAuditLog({
      actorId: req.user!.id,
      action: "ROLE_CHANGE",
      entity: "User",
      entityId: req.params.id,
      metadata: { role },
    })
    return success(res, { id: req.params.id, email: (existing.email as string) ?? null, role }, "Role updated")
  } catch (err) {
    next(err)
  }
}

export async function toggleUserStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await findById<Row>(COLLECTIONS.users, req.params.id)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "User not found")
    }
    await update(COLLECTIONS.users, req.params.id, { isActive: Boolean(req.body.isActive) })
    const user = { id: req.params.id, email: (existing.email as string) ?? null, isActive: Boolean(req.body.isActive) }
    createAuditLog({
      actorId: req.user!.id,
      action: user.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entity: "User",
      entityId: user.id,
    })
    return success(res, user, user.isActive ? "User activated" : "User deactivated")
  } catch (err) {
    next(err)
  }
}

export async function listCustomersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(
      Number(req.query.page ?? 1),
      Number(req.query.perPage ?? 20),
    )
    const search = (req.query.search as string) ?? ""

    const [userDocs, customers] = await Promise.all([
      findMany<Row>(COLLECTIONS.users, { limit: 1000 }),
      findMany<Row>(COLLECTIONS.customers, {
        orderBy: { field: "createdAt", dir: "desc" },
        limit: 1000,
      }),
    ])
    const userById = new Map<string, Row>()
    for (const u of userDocs) userById.set(String(u.id), u)

    const q = search.trim().toLowerCase()
    let filtered = customers
    if (q) {
      filtered = customers.filter((c) => {
        const u = userById.get(String(c.userId ?? c.id ?? ""))
        return (
          String(u?.email ?? "").toLowerCase().includes(q) ||
          String(u?.firstName ?? "").toLowerCase().includes(q) ||
          String(u?.lastName ?? "").toLowerCase().includes(q) ||
          String(c.company ?? "").toLowerCase().includes(q)
        )
      })
    }

    const total = filtered.length
    const pageRows = filtered.slice(skip, skip + take)

    const items = await Promise.all(
      pageRows.map(async (c) => {
        const u = userById.get(String(c.userId ?? c.id ?? ""))
        const customerId = String(c.id)
        const [orders, invoices, leads] = await Promise.all([
          countWhere(COLLECTIONS.orders, "customerId", "==", customerId),
          countWhere(COLLECTIONS.invoices, "customerId", "==", customerId),
          countWhere(COLLECTIONS.leads, "customerId", "==", customerId),
        ])
        return {
          ...c,
          user: u
            ? {
                id: u.id,
                email: (u.email as string | null) ?? null,
                firstName: (u.firstName as string | null) ?? null,
                lastName: (u.lastName as string | null) ?? null,
                phone: (u.phone as string | null) ?? null,
                avatar: (u.avatar as string | null) ?? null,
              }
            : null,
          _count: { orders, invoices, leads },
        }
      }),
    )

    return success(res, {
      items,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (err) {
    next(err)
  }
}