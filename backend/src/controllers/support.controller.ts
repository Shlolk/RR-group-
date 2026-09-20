import type { NextFunction, Request, Response } from "express"
import { success, paginate, AppError } from "@/utils/api"
import { COLLECTIONS, countWhere, create, findById, findMany, update } from "@/services/db/firestore"
import { sendTicketUpdateEmail } from "@/emails/templates"

type Row = Record<string, unknown> & { id: string }

function resolveAssigneeId(row: Row): string {
  return String(row.assignedTo ?? row.assigneeId ?? "")
}

export async function listTicketsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(Number(req.query.page ?? 1), Number(req.query.perPage ?? 20))
    const { status, priority } = req.query

    const rows = await findMany<Row>(COLLECTIONS.supportTickets, {
      orderBy: { field: "createdAt", dir: "desc" },
      limit: 500,
    })
    let tickets = rows
    if (status) tickets = tickets.filter((t) => t.status === status)
    if (priority) tickets = tickets.filter((t) => t.priority === priority)

    const total = tickets.length
    const pageItems = tickets.slice(skip, skip + take)
    const users = await findMany<Row>(COLLECTIONS.users, { limit: 500 })
    const items = await Promise.all(
      pageItems.map(async (t) => {
        const user = users.find((u) => u.id === String(t.userId))
        const assignee = users.find((u) => u.id === resolveAssigneeId(t))
        return {
          ...t,
          user: user
            ? { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar ?? null }
            : null,
          assignee: assignee
            ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName, email: assignee.email }
            : null,
          _count: { messages: await countWhere(COLLECTIONS.messages, "ticketId", "==", t.id) },
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

export async function getTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(req.user!.role)
    const ticket = await findById<Row>(COLLECTIONS.supportTickets, req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found", code: "NOT_FOUND" })
    }
    if (!isStaff && ticket.userId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "Forbidden", code: "FORBIDDEN" })
    }
    const [messageRows, users] = await Promise.all([
      findMany<Row>(COLLECTIONS.messages, {
        where: [{ field: "ticketId", op: "==", value: ticket.id }],
        limit: 500,
      }),
      findMany<Row>(COLLECTIONS.users, { limit: 500 }),
    ])
    const messages = messageRows
      .sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")))
      .map((m) => {
        const sender = users.find((u) => u.id === String(m.senderId))
        return {
          ...m,
          sender: sender
            ? { id: sender.id, firstName: sender.firstName, lastName: sender.lastName, role: sender.role, avatar: sender.avatar ?? null }
            : null,
        }
      })
    const user = users.find((u) => u.id === String(ticket.userId))
    const assignee = users.find((u) => u.id === resolveAssigneeId(ticket))
    return success(
      res,
      {
        ...ticket,
        messages,
        user: user ? { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
        assignee: assignee ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName } : null,
      },
      "Ticket fetched",
    )
  } catch (err) {
    next(err)
  }
}

export async function updateTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id
    const existing = await findById<Row>(COLLECTIONS.supportTickets, id)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Ticket not found")
    }
    const patch: Record<string, unknown> = { ...req.body }
    if (patch.assigneeId !== undefined) {
      patch.assignedTo = patch.assigneeId
      delete patch.assigneeId
    }
    await update(COLLECTIONS.supportTickets, id, patch)
    const ticket = (await findById<Row>(COLLECTIONS.supportTickets, id)) ?? { ...existing, ...patch }
    const user = await findById<Row>(COLLECTIONS.users, String(ticket.userId ?? ""))
    if (req.body.status && user) {
      sendTicketUpdateEmail(String(user.email), id, req.body.status)
    }
    return success(res, { ...ticket, user: user ? { email: String(user.email) } : null }, "Ticket updated")
  } catch (err) {
    next(err)
  }
}

export async function replyTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { content, isInternal } = req.body
    const created = await create(COLLECTIONS.messages, {
      ticketId: req.params.id,
      senderId: req.user!.id,
      content,
      isInternal: isInternal ?? false,
    })
    const timestamp = new Date().toISOString()
    const message = { ...created, createdAt: timestamp, updatedAt: timestamp }
    const ticket = await findById<Row>(COLLECTIONS.supportTickets, req.params.id)
    const user = ticket ? await findById<Row>(COLLECTIONS.users, String(ticket.userId ?? "")) : null
    if (user && !isInternal) {
      sendTicketUpdateEmail(String(user.email), req.params.id, ticket ? String(ticket.status ?? "") : "")
    }
    return success(res, message, "Reply sent", 201)
  } catch (err) {
    next(err)
  }
}

export async function listAllMessagesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const messageRows = await findMany<Row>(COLLECTIONS.messages, {
      orderBy: { field: "createdAt", dir: "desc" },
      limit: 100,
    })
    const users = await findMany<Row>(COLLECTIONS.users, { limit: 500 })
    const messages = messageRows.map((m) => {
      const sender = users.find((u) => u.id === String(m.senderId))
      const recipient = users.find((u) => u.id === String(m.recipientId))
      return {
        ...m,
        sender: sender
          ? { firstName: sender.firstName, lastName: sender.lastName, email: sender.email, avatar: sender.avatar ?? null }
          : null,
        recipient: recipient
          ? { firstName: recipient.firstName, lastName: recipient.lastName, email: recipient.email, avatar: recipient.avatar ?? null }
          : null,
      }
    })
    return success(res, messages, "Messages fetched")
  } catch (err) {
    next(err)
  }
}