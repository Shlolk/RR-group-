import type { NextFunction, Request, Response } from "express"
import { AppError, success } from "@/utils/api"
import { COLLECTIONS, create, findMany, remove, update } from "@/services/db/firestore"

export async function listInquiriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query
    const rows = await findMany(COLLECTIONS.contactInquiries, {
      where: status ? [{ field: "status", op: "==", value: status }] : undefined,
      limit: 500,
    })
    const items = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    return success(res, { items, pagination: { page: 1, perPage: items.length, total: items.length, totalPages: 1 } })
  } catch (err) {
    next(err)
  }
}

export async function updateInquiryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.contactInquiries, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "Inquiry updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteInquiryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.contactInquiries, req.params.id)
    return success(res, { id: req.params.id }, "Inquiry deleted")
  } catch (err) {
    next(err)
  }
}

export async function createInquiryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, string>
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new AppError(400, "VALIDATION_ERROR", "name, email, subject and message are required")
    }
    const inquiry = await create(COLLECTIONS.contactInquiries, {
      name: body.name,
      email: String(body.email).toLowerCase(),
      phone: body.phone ?? null,
      subject: body.subject,
      message: body.message,
      status: "NEW",
    })
    return success(res, inquiry, "Inquiry submitted", 201)
  } catch (err) {
    next(err)
  }
}