import { Router } from "express"
import { success, AppError } from "@/utils/api"
import { COLLECTIONS, countWhere, create, findMany } from "@/services/db/firestore"
import { createInquiryHandler } from "@/controllers/inquiry.controller"
import { sendEmail } from "@/emails/mailer"

const router = Router()

function mapJob(doc: Record<string, unknown> & { id: string }) {
  return {
    id: doc.id,
    slug: doc.slug ?? doc.id,
    title: doc.title,
    category: doc.category ?? null,
    type: doc.type ?? "FULL_TIME",
    location: doc.location ?? null,
    experience: doc.experience ?? null,
    description: doc.description ?? "",
    responsibilities: doc.responsibilities ?? [],
    requirements: doc.requirements ?? [],
    salaryRange: doc.salaryRange ?? null,
    postedAt: doc.createdAt ?? null,
  }
}

router.get("/services", async (_req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.services, {
      where: [{ field: "isActive", op: "==", value: true }],
    })
    return success(res, rows, "Services fetched")
  } catch (err) {
    next(err)
  }
})

router.get("/services/:slug", async (req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.services, {
      where: [{ field: "slug", op: "==", value: req.params.slug }],
      limit: 1,
    })
    const service = rows[0]
    if (!service) {
      throw new AppError(404, "NOT_FOUND", "Service not found")
    }
    return success(res, service, "Service fetched")
  } catch (err) {
    next(err)
  }
})

router.post("/services", async (req, res, next) => {
  try {
    throw new AppError(403, "FORBIDDEN", "Service creation requires admin privileges")
  } catch (err) {
    next(err)
  }
})

router.get("/blog", async (_req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.blogPosts, {
      where: [{ field: "isPublished", op: "==", value: true }],
      limit: 200,
    })
    const posts = rows
      .filter((p) => !p.publishedAt || new Date(String(p.publishedAt)) <= new Date())
      .sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")))
    return success(res, posts, "Blog posts fetched")
  } catch (err) {
    next(err)
  }
})

router.get("/blog/:slug", async (req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.blogPosts, {
      where: [{ field: "slug", op: "==", value: req.params.slug }],
      limit: 1,
    })
    const post = rows[0]
    if (!post || !post.isPublished) {
      throw new AppError(404, "NOT_FOUND", "Post not found")
    }
    return success(res, post, "Blog post fetched")
  } catch (err) {
    next(err)
  }
})

router.get("/faqs", async (_req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.faqs, {
      where: [{ field: "isActive", op: "==", value: true }],
    })
    return success(res, rows, "FAQs fetched")
  } catch (err) {
    next(err)
  }
})

router.get("/testimonials", async (_req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.testimonials, {
      where: [{ field: "isActive", op: "==", value: true }],
    })
    return success(res, rows, "Testimonials fetched")
  } catch (err) {
    next(err)
  }
})

router.get("/portfolio", async (_req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.projects, {
      where: [{ field: "isActive", op: "==", value: true }],
    })
    return success(res, rows, "Portfolio fetched")
  } catch (err) {
    next(err)
  }
})

router.get("/jobs", async (_req, res, next) => {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.jobs, {
      where: [{ field: "isActive", op: "==", value: true }],
    })
    return success(res, rows.map(mapJob), "Job openings fetched")
  } catch (err) {
    next(err)
  }
})

router.post("/applications", async (req, res, next) => {
  try {
    const { fullName, email, phone, position } = req.body as Record<string, string>
    if (!fullName || !email || !position) {
      throw new AppError(400, "VALIDATION_ERROR", "fullName, email and position are required")
    }
    const application = await create(COLLECTIONS.careerApplications, {
      fullName,
      email: String(email).toLowerCase(),
      phone,
      location: req.body.location ?? null,
      position,
      experience: req.body.experience ?? null,
      portfolio: req.body.portfolio ?? null,
      github: req.body.github ?? null,
      coverLetter: req.body.coverLetter ?? null,
      status: "NEW",
      source: "careers",
    })
    return success(res, application, "Application submitted", 201)
  } catch (err) {
    next(err)
  }
})

router.post("/contact", createInquiryHandler)

router.post("/newsletter", async (req, res, next) => {
  try {
    const { email } = req.body as { email?: string }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new AppError(400, "VALIDATION_ERROR", "Valid email required")
    }
    const normalized = String(email).toLowerCase()
    const found = await findMany(COLLECTIONS.newsletterSubscribers, {
      where: [{ field: "email", op: "==", value: normalized }],
      limit: 1,
    })
    let subscriber: { id: string }
    if (found.length) {
      subscriber = { id: String(found[0].id) }
    } else {
      subscriber = await create(COLLECTIONS.newsletterSubscribers, { email: normalized, isActive: true })
    }
    const count = await countWhere(COLLECTIONS.newsletterSubscribers, "isActive", "==", true)
    sendEmail({
      to: normalized,
      subject: "Newsletter subscription confirmed",
      html: "<p>Thanks for subscribing to RR GROUP updates.</p>",
    })
    return success(res, { ...subscriber, subscriberCount: count }, "Subscribed", 201)
  } catch (err) {
    next(err)
  }
})

router.get("/health", (_req, res) => {
  return success(res, { ok: true, timestamp: new Date().toISOString() }, "OK")
})

export default router