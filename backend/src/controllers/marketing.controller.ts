import type { NextFunction, Request, Response } from "express"
import { success, AppError } from "@/utils/api"
import { COLLECTIONS, countWhere, create, findById, findMany, now, update } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

export async function listCampaignsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Row>(COLLECTIONS.campaigns, { orderBy: { field: "createdAt", dir: "desc" } })
    const creators = await findMany<Row>(COLLECTIONS.users, { limit: 500 })
    const campaigns = await Promise.all(
      rows.map(async (c) => {
        const creator = creators.find((u) => u.id === String(c.createdById))
        return {
          ...c,
          creator: creator
            ? { id: creator.id, firstName: creator.firstName ?? null, lastName: creator.lastName ?? null, email: creator.email ?? null }
            : null,
          _count: { leads: await countWhere(COLLECTIONS.leads, "campaignId", "==", c.id) },
        }
      }),
    )
    return success(res, campaigns, "Campaigns fetched")
  } catch (err) {
    next(err)
  }
}

export async function createCampaignHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await create(COLLECTIONS.campaigns, {
      name: req.body.name,
      description: req.body.description ?? null,
      type: req.body.type ?? "EMAIL",
      status: req.body.status ?? "DRAFT",
      audience: req.body.audience ?? null,
      content: req.body.content ?? null,
      subject: req.body.subject ?? null,
      scheduleAt: req.body.scheduleAt ? new Date(req.body.scheduleAt).toISOString() : null,
      createdById: req.user!.id,
    })
    return success(res, { ...campaign, createdAt: now(), updatedAt: now() }, "Campaign created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateCampaignHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id
    const existing = await findById<Row>(COLLECTIONS.campaigns, id)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Campaign not found")
    }
    const data = { ...req.body }
    if (data.scheduleAt) data.scheduleAt = new Date(data.scheduleAt).toISOString()
    await update(COLLECTIONS.campaigns, id, data)
    const campaign = (await findById<Row>(COLLECTIONS.campaigns, id)) ?? { id }
    return success(res, campaign, "Campaign updated")
  } catch (err) {
    next(err)
  }
}

export async function campaignAnalyticsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await findById<Row>(COLLECTIONS.campaigns, req.params.id)
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found", code: "NOT_FOUND" })
    }
    const analytics = Array.isArray(campaign.analytics) ? campaign.analytics : []
    const leads = await findMany<Row>(COLLECTIONS.leads, {
      where: [{ field: "campaignId", op: "==", value: campaign.id }],
      limit: 500,
    })
    return success(res, { ...campaign, analytics, leads }, "Campaign analytics fetched")
  } catch (err) {
    next(err)
  }
}