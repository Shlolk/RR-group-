import type { NextFunction, Request, Response } from "express"
import { success, paginate } from "@/utils/api"
import { COLLECTIONS, findById, findMany } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

export async function listAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(Number(req.query.page ?? 1), Number(req.query.perPage ?? 30))
    const { action, entity, module, userId, date, dateFrom, dateTo } = req.query

    const rows = await findMany<Row>(COLLECTIONS.auditLogs, { limit: 1000 })
    let logs = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))

    if (action) {
      const value = String(action)
      logs = logs.filter((l) => l.action === value)
    }
    if (entity) {
      const value = String(entity)
      logs = logs.filter((l) => l.entity === value || l.resourceType === value)
    }
    if (module) {
      const value = String(module)
      logs = logs.filter((l) => l.module === value)
    }
    if (userId) {
      const value = String(userId)
      logs = logs.filter((l) => l.userId === value || l.actorId === value)
    }
    if (date) {
      const day = String(date).slice(0, 10)
      logs = logs.filter((l) => String(l.createdAt ?? "").slice(0, 10) === day)
    }
    if (dateFrom) {
      const value = String(dateFrom)
      const from = value.length === 10 ? `${value}T00:00:00.000Z` : value
      logs = logs.filter((l) => String(l.createdAt ?? "") >= from)
    }
    if (dateTo) {
      const value = String(dateTo)
      const to = value.length === 10 ? `${value}T23:59:59.999Z` : value
      logs = logs.filter((l) => String(l.createdAt ?? "") <= to)
    }

    const total = logs.length
    const pageItems = logs.slice(skip, skip + take)

    const actorIds = Array.from(new Set(pageItems.map((l) => String(l.actorId ?? l.userId ?? "")).filter(Boolean)))
    const actors = (await Promise.all(actorIds.map((id) => findById<Row>(COLLECTIONS.users, id)))).filter(Boolean) as Row[]
    const actorMap = new Map(actors.map((u) => [u.id, u]))

    const items = pageItems.map((l) => {
      const actorId = String(l.actorId ?? l.userId ?? "")
      const actor = actorMap.get(actorId)
      return {
        ...l,
        actor: actor
          ? {
              id: actor.id,
              firstName: actor.firstName ?? null,
              lastName: actor.lastName ?? null,
              email: actor.email ?? null,
              role: actor.role ?? null,
            }
          : null,
      }
    })

    return success(res, {
      items,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (err) {
    next(err)
  }
}