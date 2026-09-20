import type { NextFunction, Request, Response } from "express"
import { success, paginate } from "@/utils/api"
import { COLLECTIONS, create, findById, findMany, now, update } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

export async function listNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(req.user!.role)
    const { skip, take, page, perPage } = paginate(Number(req.query.page ?? 1), Number(req.query.perPage ?? 20))

    const rows = isStaff
      ? await findMany<Row>(COLLECTIONS.notifications, { limit: 1000 })
      : await findMany<Row>(COLLECTIONS.notifications, {
          where: [{ field: "userId", op: "==", value: userId }],
          limit: 1000,
        })

    const sorted = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    const total = sorted.length
    const unreadCount = sorted.filter((n) => !n.readAt).length
    const items = sorted.slice(skip, skip + take)

    return success(res, {
      items,
      unreadCount,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (err) {
    next(err)
  }
}

export async function broadcastNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, message, type, link } = req.body
    const users = await findMany<Row>(COLLECTIONS.users, {
      where: [{ field: "isActive", op: "==", value: true }],
      limit: 500,
    })
    await Promise.all(
      users.map((u) =>
        create(COLLECTIONS.notifications, {
          userId: u.id,
          title,
          message,
          type: type ?? "notification",
          link: link ?? null,
          readAt: null,
          createdBy: req.user!.id,
        }),
      ),
    )
    return success(res, { sentTo: users.length }, "Notification broadcast sent", 201)
  } catch (err) {
    next(err)
  }
}

export async function markNotificationReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await findById<Row>(COLLECTIONS.notifications, req.params.id)
    if (notification && notification.userId === req.user!.id) {
      await update(COLLECTIONS.notifications, req.params.id, { readAt: now() })
    }
    return success(res, null, "Notification marked as read")
  } catch (err) {
    next(err)
  }
}

export async function markAllNotificationsReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Row>(COLLECTIONS.notifications, {
      where: [{ field: "userId", op: "==", value: req.user!.id }],
      limit: 1000,
    })
    await Promise.all(
      rows
        .filter((n) => !n.readAt)
        .map((n) => update(COLLECTIONS.notifications, n.id, { readAt: now() })),
    )
    return success(res, null, "All notifications marked as read")
  } catch (err) {
    next(err)
  }
}