import type { NextFunction, Request, Response } from "express"
import { success, paginate } from "@/utils/api"
import { COLLECTIONS, create, findById, findMany, now, remove, update } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

function leadInteractions(lead: Row, take?: number): Record<string, unknown>[] {
  const timeline = Array.isArray(lead.timeline) ? (lead.timeline as Record<string, unknown>[]) : []
  const interactions = timeline
    .filter((entry) => entry != null && typeof entry.type === "string")
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
  return take ? interactions.slice(0, take) : interactions
}

async function enrichLeads(leads: Row[], interactionTake?: number): Promise<Row[]> {
  const assigneeIds = new Set<string>()
  const customerIds = new Set<string>()
  for (const lead of leads) {
    if (lead.assignedTo != null) assigneeIds.add(String(lead.assignedTo))
    if (lead.customerId != null) customerIds.add(String(lead.customerId))
  }

  const assignees = await Promise.all([...assigneeIds].map((id) => findById<Row>(COLLECTIONS.users, id)))
  const customerDocs = await Promise.all([...customerIds].map((id) => findById<Row>(COLLECTIONS.customers, id)))

  const customerUserIds = new Set<string>()
  for (const c of customerDocs) if (c != null && c.userId != null) customerUserIds.add(String(c.userId))
  const customerUsers = await Promise.all([...customerUserIds].map((id) => findById<Row>(COLLECTIONS.users, id)))

  const assigneeMap = new Map<string, Row>()
  for (const u of assignees) if (u != null) assigneeMap.set(u.id, u)
  const customerMap = new Map<string, Row>()
  for (const c of customerDocs) if (c != null) customerMap.set(c.id, c)
  const customerUserMap = new Map<string, Row>()
  for (const u of customerUsers) if (u != null) customerUserMap.set(u.id, u)

  return leads.map((lead) => {
    const item: Row = { ...lead }
    const assignee = lead.assignedTo != null ? assigneeMap.get(String(lead.assignedTo)) : undefined
    item.assignee = assignee
      ? { id: assignee.id, firstName: assignee.firstName ?? null, lastName: assignee.lastName ?? null, email: assignee.email ?? null }
      : null
    const customer = lead.customerId != null ? customerMap.get(String(lead.customerId)) : undefined
    if (customer) {
      const user = customer.userId != null ? customerUserMap.get(String(customer.userId)) : undefined
      item.customer = {
        ...customer,
        user: user ? { email: user.email ?? null, firstName: user.firstName ?? null, lastName: user.lastName ?? null } : null,
      }
    } else {
      item.customer = null
    }
    item.interactions = leadInteractions(lead, interactionTake)
    return item
  })
}

export async function listLeadsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(Number(req.query.page ?? 1), Number(req.query.perPage ?? 20))
    const { search, status, assignedTo } = req.query

    const where: { field: string; op: "=="; value: unknown }[] = []
    if (status) where.push({ field: "status", op: "==", value: status })
    if (assignedTo) where.push({ field: "assignedTo", op: "==", value: assignedTo })

    const rows = await findMany<Row>(COLLECTIONS.leads, {
      where: where.length ? where : undefined,
      limit: 500,
    })

    const q = search ? String(search).toLowerCase() : ""
    const filtered = q
      ? rows.filter((lead) => [lead.name, lead.email, lead.company].some((v) => v != null && String(v).toLowerCase().includes(q)))
      : rows

    const sorted = filtered.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const paginated = sorted.slice(skip, skip + take)
    const items = await enrichLeads(paginated, 5)

    return success(res, {
      items,
      pagination: { page, perPage, total: filtered.length, totalPages: Math.ceil(filtered.length / perPage) },
    })
  } catch (err) {
    next(err)
  }
}

export async function getLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await findById<Row>(COLLECTIONS.leads, req.params.id)
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found", code: "NOT_FOUND" })
    }
    const [enriched] = await enrichLeads([lead])
    return success(res, enriched, "Lead fetched")
  } catch (err) {
    next(err)
  }
}

export async function manageLeadsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>
    if (req.method === "POST") {
      const lead = (await create(COLLECTIONS.leads, {
        ...body,
        status: (body.status as string | undefined) ?? "NEW",
      })) as Row
      return success(res, { ...lead, createdAt: lead.createdAt ?? now(), updatedAt: lead.updatedAt ?? now() }, "Lead created", 201)
    }
    await update(COLLECTIONS.leads, req.params.id, body)
    const updated = await findById<Row>(COLLECTIONS.leads, req.params.id)
    return success(res, updated ?? { id: req.params.id, ...body }, "Lead updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.leads, req.params.id)
    return success(res, null, "Lead deleted")
  } catch (err) {
    next(err)
  }
}

export async function convertLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await findById<Row>(COLLECTIONS.leads, req.params.id)
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found", code: "NOT_FOUND" })
    }
    await update(COLLECTIONS.leads, lead.id, { status: "WON", convertedAt: now() })
    const updated = await findById<Row>(COLLECTIONS.leads, lead.id)
    return success(res, updated ?? { ...lead, status: "WON", convertedAt: now() }, "Lead converted")
  } catch (err) {
    next(err)
  }
}