import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import { COLLECTIONS, create, findMany, remove, update } from "@/services/db/firestore"

export async function listBlogPostsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.blogPosts, { limit: 500 })
    const posts = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    return success(res, posts, "Blog posts fetched")
  } catch (err) {
    next(err)
  }
}

export async function createBlogPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>
    const post = await create(COLLECTIONS.blogPosts, {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt ?? "",
      content: body.content ?? "",
      coverImage: body.coverImage ?? null,
      authorId: req.user?.id,
      category: body.category ?? null,
      tags: body.tags ?? [],
      isPublished: Boolean(body.isPublished),
      publishedAt: body.isPublished ? new Date().toISOString() : null,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      viewCount: 0,
      isActive: true,
    })
    return success(res, post, "Blog post created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateBlogPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...(req.body as Record<string, unknown>) }
    if (data.isPublished === true) data.publishedAt = data.publishedAt ?? new Date().toISOString()
    await update(COLLECTIONS.blogPosts, req.params.id, data)
    return success(res, { id: req.params.id, ...data }, "Blog post updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteBlogPostHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.blogPosts, req.params.id)
    return success(res, null, "Blog post deleted")
  } catch (err) {
    next(err)
  }
}

export async function listFaqHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.faqs, { limit: 500 })
    const faqs = rows.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    return success(res, faqs, "FAQs fetched")
  } catch (err) {
    next(err)
  }
}

export async function createFaqHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const faq = await create(COLLECTIONS.faqs, req.body as Record<string, unknown>)
    return success(res, faq, "FAQ created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateFaqHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.faqs, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "FAQ updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteFaqHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.faqs, req.params.id)
    return success(res, null, "FAQ deleted")
  } catch (err) {
    next(err)
  }
}

export async function listTestimonialsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.testimonials, { limit: 500 })
    const testimonials = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    return success(res, testimonials, "Testimonials fetched")
  } catch (err) {
    next(err)
  }
}

export async function createTestimonialHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonial = await create(COLLECTIONS.testimonials, req.body as Record<string, unknown>)
    return success(res, testimonial, "Testimonial created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateTestimonialHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.testimonials, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "Testimonial updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteTestimonialHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.testimonials, req.params.id)
    return success(res, null, "Testimonial deleted")
  } catch (err) {
    next(err)
  }
}

export async function listPortfolioHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.projects, {
      where: req.query.active === "true" ? [{ field: "isActive", op: "==", value: true }] : undefined,
      limit: 500,
    })
    const projects = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    return success(res, projects, "Portfolio projects fetched")
  } catch (err) {
    next(err)
  }
}

export async function createPortfolioHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await create(COLLECTIONS.projects, req.body as Record<string, unknown>)
    return success(res, project, "Portfolio project created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updatePortfolioHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.projects, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "Portfolio project updated")
  } catch (err) {
    next(err)
  }
}

export async function deletePortfolioHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.projects, req.params.id)
    return success(res, null, "Portfolio project deleted")
  } catch (err) {
    next(err)
  }
}

export async function listJobsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.jobs, { limit: 500 })
    const jobs = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    return success(res, jobs, "Jobs fetched")
  } catch (err) {
    next(err)
  }
}

export async function createJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await create(COLLECTIONS.jobs, {
      ...(req.body as Record<string, unknown>),
      isActive: req.body.isActive ?? true,
    })
    return success(res, job, "Job created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.jobs, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "Job updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await remove(COLLECTIONS.jobs, req.params.id)
    return success(res, null, "Job deleted")
  } catch (err) {
    next(err)
  }
}

export async function listApplicationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.careerApplications, { limit: 500 })
    const applications = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    return success(res, applications, "Applications fetched")
  } catch (err) {
    next(err)
  }
}

export async function updateApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.careerApplications, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "Application updated")
  } catch (err) {
    next(err)
  }
}