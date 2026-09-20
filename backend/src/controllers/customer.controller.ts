import type { NextFunction, Request, Response } from "express"
import { success, paginate, AppError } from "@/utils/api"
import * as authService from "@/services/auth/auth.service"
import { profileUpdateSchema, passwordChangeSchema, addressSchema } from "@/validators/auth"
import { COLLECTIONS, findById, findMany, countWhere, create, update, remove, now } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = profileUpdateSchema.parse(req.body)
    const userId = req.user!.id
    const existing = await findById(COLLECTIONS.users, userId)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "User not found")
    }
    await update(COLLECTIONS.users, userId, input as Record<string, unknown>)
    const user = await findById<Row>(COLLECTIONS.users, userId)
    return success(res, {
      id: user?.id ?? userId,
      email: (user?.email as string) ?? (existing.email as string) ?? null,
      firstName: (user?.firstName as string | null) ?? null,
      lastName: (user?.lastName as string | null) ?? null,
      phone: (user?.phone as string | null) ?? null,
      avatar: (user?.avatar as string | null) ?? null,
      role: (user?.role as string | null) ?? null,
    }, "Profile updated")
  } catch (err) {
    next(err)
  }
}

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = passwordChangeSchema.parse(req.body)
    await authService.changePassword(req.user!.id, input.currentPassword, input.newPassword)
    return success(res, null, "Password changed")
  } catch (err) {
    next(err)
  }
}

export async function updateCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const existing = await findById(COLLECTIONS.customers, userId)
    if (existing) {
      await update(COLLECTIONS.customers, userId, req.body as Record<string, unknown>)
      const updated = await findById(COLLECTIONS.customers, userId)
      return success(res, updated, "Customer profile updated")
    }
    const created = await create(COLLECTIONS.customers, { id: userId, userId, ...(req.body as Record<string, unknown>) })
    const fresh = await findById(COLLECTIONS.customers, created.id)
    return success(res, fresh ?? created, "Customer profile updated")
  } catch (err) {
    next(err)
  }
}

export async function getCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const customer = await findById<Row>(COLLECTIONS.customers, userId)
    if (!customer) {
      throw new AppError(404, "NOT_FOUND", "Customer profile not found")
    }
    const user = await findById(COLLECTIONS.users, userId)
    const addresses = await findMany<Row>(COLLECTIONS.addresses, {
      where: [{ field: "userId", op: "==", value: userId }],
      limit: 500,
    })
    addresses.sort((a, b) => Number(b.isDefault === true) - Number(a.isDefault === true))
    return success(res, {
      ...customer,
      user: {
        email: (user?.email as string | null) ?? null,
        firstName: (user?.firstName as string | null) ?? null,
        lastName: (user?.lastName as string | null) ?? null,
        phone: (user?.phone as string | null) ?? null,
        avatar: (user?.avatar as string | null) ?? null,
      },
      addresses,
    }, "Customer profile fetched")
  } catch (err) {
    next(err)
  }
}

export async function listAddressesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await findMany<Row>(COLLECTIONS.addresses, {
      where: [{ field: "userId", op: "==", value: req.user!.id }],
      limit: 500,
    })
    addresses.sort((a, b) => Number(b.isDefault === true) - Number(a.isDefault === true))
    return success(res, addresses, "Addresses fetched")
  } catch (err) {
    next(err)
  }
}

export async function createAddressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addressSchema.parse(req.body)
    const userId = req.user!.id
    if (input.isDefault) {
      const others = await findMany<Row>(COLLECTIONS.addresses, {
        where: [{ field: "userId", op: "==", value: userId }],
        limit: 500,
      })
      await Promise.all(others.map((a) => update(COLLECTIONS.addresses, a.id, { isDefault: false })))
    }
    const created = await create(COLLECTIONS.addresses, { userId, ...(input as Record<string, unknown>) })
    const address = await findById(COLLECTIONS.addresses, created.id)
    return success(res, address ?? { ...created, createdAt: now(), updatedAt: now() }, "Address created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateAddressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addressSchema.partial().parse(req.body)
    const userId = req.user!.id
    if (input.isDefault) {
      const others = await findMany<Row>(COLLECTIONS.addresses, {
        where: [{ field: "userId", op: "==", value: userId }],
        limit: 500,
      })
      await Promise.all(others.map((a) => update(COLLECTIONS.addresses, a.id, { isDefault: false })))
    }
    const existing = await findById(COLLECTIONS.addresses, req.params.id)
    if (!existing || String(existing.userId) !== userId) {
      throw new AppError(404, "NOT_FOUND", "Address not found")
    }
    await update(COLLECTIONS.addresses, req.params.id, input as Record<string, unknown>)
    return success(res, null, "Address updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteAddressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await findById(COLLECTIONS.addresses, req.params.id)
    if (existing && String(existing.userId) === req.user!.id) {
      await remove(COLLECTIONS.addresses, req.params.id)
    }
    return success(res, null, "Address deleted")
  } catch (err) {
    next(err)
  }
}

export async function getMyNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(Number(req.query.page ?? 1), Number(req.query.perPage ?? 20))
    const userId = req.user!.id
    const docs = (await findMany<Row>(COLLECTIONS.notifications, {
      where: [{ field: "userId", op: "==", value: userId }],
      limit: 1000,
    })).sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const items = docs.slice(skip, skip + take).map((d) => ({ ...d }))
    const total = docs.length
    const unreadCount = docs.filter((d) => !d.readAt).length
    return success(res, {
      items,
      unreadCount,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (err) {
    next(err)
  }
}

export async function markNotificationReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await findById(COLLECTIONS.notifications, req.params.id)
    if (doc && String(doc.userId) === req.user!.id) {
      await update(COLLECTIONS.notifications, req.params.id, { readAt: now() })
    }
    return success(res, null, "Notification marked as read")
  } catch (err) {
    next(err)
  }
}

export async function markAllNotificationsReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const docs = await findMany<Row>(COLLECTIONS.notifications, {
      where: [{ field: "userId", op: "==", value: userId }],
      limit: 500,
    })
    await Promise.all(
      docs
        .filter((d) => d.readAt == null)
        .map((d) => update(COLLECTIONS.notifications, d.id, { readAt: now() })),
    )
    return success(res, null, "All notifications marked as read")
  } catch (err) {
    next(err)
  }
}

export async function createSupportTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, description, priority, orderId } = req.body
    if (!subject || !description) {
      throw new AppError(400, "VALIDATION_ERROR", "Subject and description are required")
    }
    const created = await create(COLLECTIONS.supportTickets, {
      userId: req.user!.id,
      orderId: orderId ?? null,
      subject,
      description,
      priority: priority ?? "MEDIUM",
      status: "OPEN",
    })
    const ticket = await findById(COLLECTIONS.supportTickets, created.id)
    return success(res, ticket ?? { ...created, createdAt: now(), updatedAt: now() }, "Support ticket created", 201)
  } catch (err) {
    next(err)
  }
}

export async function getMyTicketsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tickets = (await findMany<Row>(COLLECTIONS.supportTickets, {
      where: [{ field: "userId", op: "==", value: req.user!.id }],
      limit: 500,
    })).sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const items = await Promise.all(
      tickets.map(async (t) => {
        const messages = await countWhere(COLLECTIONS.messages, "ticketId", "==", t.id)
        return { ...t, _count: { messages } }
      }),
    )
    return success(res, items, "Tickets fetched")
  } catch (err) {
    next(err)
  }
}

export async function getMyTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await findById<Row>(COLLECTIONS.supportTickets, req.params.id)
    if (!ticket || String(ticket.userId) !== req.user!.id) {
      throw new AppError(404, "NOT_FOUND", "Ticket not found")
    }
    const messageRows = (await findMany<Row>(COLLECTIONS.messages, {
      where: [{ field: "ticketId", op: "==", value: req.params.id }],
      limit: 500,
    })).sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")))
    const messages = await Promise.all(
      messageRows.map(async (m) => {
        const sender = await findById(COLLECTIONS.users, String(m.senderId ?? ""))
        return {
          ...m,
          sender: {
            firstName: (sender?.firstName as string | null) ?? null,
            lastName: (sender?.lastName as string | null) ?? null,
            role: (sender?.role as string | null) ?? null,
            avatar: (sender?.avatar as string | null) ?? null,
          },
        }
      }),
    )
    return success(res, { ...ticket, messages }, "Ticket fetched")
  } catch (err) {
    next(err)
  }
}

export async function replyToMyTicketHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await findById(COLLECTIONS.supportTickets, req.params.id)
    if (!ticket || String(ticket.userId) !== req.user!.id) {
      throw new AppError(404, "NOT_FOUND", "Ticket not found")
    }
    const created = await create(COLLECTIONS.messages, {
      ticketId: req.params.id,
      senderId: req.user!.id,
      content: req.body.content,
      isInternal: false,
      attachments: [],
    })
    const message = await findById(COLLECTIONS.messages, created.id)
    return success(res, message ?? { ...created, createdAt: now() }, "Reply sent", 201)
  } catch (err) {
    next(err)
  }
}

export async function getMyMessagesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const [outgoing, incoming] = await Promise.all([
      findMany<Row>(COLLECTIONS.messages, { where: [{ field: "senderId", op: "==", value: userId }], limit: 300 }),
      findMany<Row>(COLLECTIONS.messages, { where: [{ field: "recipientId", op: "==", value: userId }], limit: 300 }),
    ])
    const merged = new Map<string, Row>()
    for (const m of [...outgoing, ...incoming]) {
      if (m.ticketId) continue
      if (!merged.has(m.id)) merged.set(m.id, m)
    }
    const chatMessages = [...merged.values()]
      .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
      .slice(0, 50)

    const userIds = new Set<string>()
    for (const m of chatMessages) {
      if (m.senderId) userIds.add(String(m.senderId))
      if (m.recipientId) userIds.add(String(m.recipientId))
    }
    const userDocs = await Promise.all([...userIds].map((id) => findById<Row>(COLLECTIONS.users, id)))
    const userById = new Map<string, Row>()
    for (const u of userDocs) {
      if (u) userById.set(String(u.id), u)
    }
    const preview = (u?: Row) =>
      u
        ? {
            firstName: (u.firstName as string | null) ?? null,
            lastName: (u.lastName as string | null) ?? null,
            avatar: (u.avatar as string | null) ?? null,
          }
        : null
    const messages = chatMessages.map((m) => ({
      ...m,
      sender: preview(userById.get(String(m.senderId ?? ""))),
      recipient: m.recipientId ? preview(userById.get(String(m.recipientId))) : null,
    }))
    return success(res, messages, "Messages fetched")
  } catch (err) {
    next(err)
  }
}

export async function createServiceRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { serviceId, title, description, priority, desiredDate } = req.body
    const service = await findById(COLLECTIONS.services, serviceId)
    if (!service) {
      throw new AppError(404, "NOT_FOUND", "Service not found")
    }
    const created = await create(COLLECTIONS.serviceRequests, {
      userId: req.user!.id,
      serviceId,
      title,
      description: description ?? null,
      priority: priority ?? "MEDIUM",
      desiredDate: desiredDate ? new Date(desiredDate).toISOString() : null,
      status: "PENDING",
    })
    const request = await findById(COLLECTIONS.serviceRequests, created.id)
    return success(res, request ?? { ...created, createdAt: now(), updatedAt: now() }, "Service request created", 201)
  } catch (err) {
    next(err)
  }
}

export async function getMyServiceRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const requests = (await findMany<Row>(COLLECTIONS.serviceRequests, {
      where: [{ field: "userId", op: "==", value: req.user!.id }],
      limit: 500,
    })).sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const items = await Promise.all(
      requests.map(async (r) => {
        const service = await findById(COLLECTIONS.services, String(r.serviceId ?? ""))
        return {
          ...r,
          service: service
            ? {
                id: service.id,
                name: (service.name as string | null) ?? null,
                slug: (service.slug as string | null) ?? null,
                icon: (service.icon as string | null) ?? null,
              }
            : null,
        }
      }),
    )
    return success(res, items, "Service requests fetched")
  } catch (err) {
    next(err)
  }
}