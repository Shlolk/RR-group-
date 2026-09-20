import type { ApiCategory, ApiProduct, ApiService, Paginated } from "@/lib/api-types"
import { toProduct, toCategory } from "@/lib/adapters"
import type { Category, Product } from "@/lib/types"
import { fetchCategories, fetchProductBySlug, fetchProducts, fetchServices } from "@/lib/services/api"
import { fetchPortfolio, fetchBlogPosts, fetchJobOpenings, fetchFaqs, fetchTestimonials } from "@/lib/services/api"
import {
  categories as mockCategories,
  products as mockProducts,
  getProductBySlug as mockGetProductBySlug,
  getProductsByCategory as mockGetProductsByCategory,
  getRelatedProducts as mockGetRelatedProducts,
} from "@/lib/mock-data"
import {
  type BlogPost,
  type Job,
  type PortfolioProject,
  type ServiceContent,
  blogPosts as mockBlogPosts,
  jobs as mockJobs,
  portfolioProjects as mockPortfolioProjects,
  services as mockServices,
  testimonials as mockTestimonials,
  faqs as mockFaqs,
  getBlogBySlug as mockGetBlogBySlug,
  getJobById as mockGetJobById,
  getPortfolioBySlug as mockGetPortfolioBySlug,
  getRelatedPortfolio as mockGetRelatedPortfolio,
  getRelatedPosts as mockGetRelatedPosts,
  getServiceBySlug as mockGetServiceBySlug,
} from "@/lib/content-data"

// Server-side data access with graceful fallback to mock data.
// Tries the real backend (via the /api rewrite) first; if the backend or
// database is unavailable, renders with the seed/mock dataset instead.

export async function loadProducts(options?: {
  category?: string
  sort?: string
  search?: string
}): Promise<Product[]> {
  try {
    const res = await fetchProducts({
      category: options?.category,
      sort: options?.sort,
      search: options?.search,
      inStock: true,
    })
    // fetchProducts is typed as Paginated<ApiProduct>; apiFetch already unwraps ApiEnvelope.data,
    // so res is Paginated<ApiProduct> (with items + pagination), not an ApiEnvelope.
    let apiProducts: ApiProduct[] = []
    if (res && typeof res === "object" && "items" in res && Array.isArray((res as Paginated<ApiProduct>).items)) {
      apiProducts = (res as Paginated<ApiProduct>).items
    } else if (Array.isArray(res)) {
      apiProducts = res as ApiProduct[]
    }
    if (!apiProducts.length) return []
    return apiProducts.map(toProduct)
  } catch {
    const mock = mockGetProductsByCategory(options?.category ?? "")
    return mock.length ? mock : mockProducts
  }
}

export async function loadProduct(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const res = await fetchProductBySlug(slug)
    if (!res?.product) return null
    return {
      product: toProduct(res.product),
      related: (res.related ?? []).map(toProduct),
    }
  } catch {
    const product = mockGetProductBySlug(slug)
    if (!product) return null
    return { product, related: mockGetRelatedProducts(product) }
  }
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const res = await fetchCategories()
    // fetchCategories returns { items: ApiCategory[] } already unwrapped from ApiEnvelope by apiFetch
    let apiCategories: ApiCategory[] = []
    if (res && typeof res === "object" && "items" in res && Array.isArray((res as { items: unknown }).items)) {
      apiCategories = (res as { items: ApiCategory[] }).items
    } else if (Array.isArray(res)) {
      apiCategories = res as ApiCategory[]
    }
    const mapped = apiCategories.map(toCategory).filter(Boolean) as Category[]
    return mapped.length ? mapped : mockCategories
  } catch {
    return mockCategories
  }
}

export async function loadCategory(slug: string): Promise<{ category: Category; products: Product[] } | null> {
  const cats = await loadCategories()
  const category = cats.find((c) => c.slug === slug) ?? null
  if (!category) return null
  const products = await loadProducts({ category: slug })
  return { category, products }
}

// Corporate content loaders — same API-first, content-fallback pattern.

export async function loadServices(): Promise<ServiceContent[]> {
  try {
    const res = await fetchServices()
    // fetchServices returns array already unwrapped from ApiEnvelope by apiFetch
    const list: ApiService[] = Array.isArray(res) ? (res as ApiService[]) : []
    // Prefer seeded content when the backend has no active services yet.
    if (!list.length) return mockServices
    return list.map((s, index) => {
      const seeded = mockGetServiceBySlug(s.slug ?? s.id ?? "")
      if (seeded) return { ...seeded, name: s.name, shortDescription: s.description ?? seeded.shortDescription }
      return {
        slug: s.slug ?? s.id ?? `service-${index}`,
        name: s.name,
        icon: s.icon ?? "Box",
        tagline: s.description?.slice(0, 90) ?? "",
        shortDescription: s.description?.slice(0, 140) ?? "",
        description: s.description ?? "",
        problems: [],
        offerings: [],
        features: s.features ?? [],
        benefits: [],
        process: [],
        technologies: [],
        useCases: [],
        faqs: [],
        cta: "Get Started",
        ctaDescription: "",
      }
    })
  } catch {
    return mockServices
  }
}

export async function loadService(slug: string): Promise<ServiceContent | null> {
  const list = await loadServices()
  return list.find((s) => s.slug === slug) ?? mockGetServiceBySlug(slug) ?? null
}

export async function loadPortfolio(): Promise<PortfolioProject[]> {
  try {
    const res = await fetchPortfolio()
    const list = Array.isArray(res)
      ? (res as { slug?: string; title?: string; summary?: string }[])
      : []
    if (list.length === 0) return mockPortfolioProjects
    return list
      .map((p) => {
        const seeded = mockGetPortfolioBySlug(p.slug ?? "")
        if (!seeded) return null
        return { ...seeded, title: p.title ?? seeded.title, summary: p.summary ?? seeded.summary }
      })
      .filter((x): x is PortfolioProject => x !== null)
  } catch {
    return mockPortfolioProjects
  }
}

export async function loadPortfolioProject(slug: string): Promise<PortfolioProject | null> {
  const list = await loadPortfolio()
  return list.find((p) => p.slug === slug) ?? mockGetPortfolioBySlug(slug) ?? null
}

export async function loadBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetchBlogPosts()
    const list = Array.isArray(res)
      ? (res as { slug?: string; title?: string; category?: string }[])
      : []
    if (list.length === 0) return mockBlogPosts
    return list
      .map((p) => {
        const seeded = mockGetBlogBySlug(p.slug ?? "")
        if (!seeded) return null
        return { ...seeded, title: p.title ?? seeded.title, category: p.category ?? seeded.category }
      })
      .filter((x): x is BlogPost => x !== null)
  } catch {
    return mockBlogPosts
  }
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  const list = await loadBlogPosts()
  return list.find((b) => b.slug === slug) ?? mockGetBlogBySlug(slug) ?? null
}

export async function loadJobs(): Promise<Job[]> {
  try {
    const res = await fetchJobOpenings()
    if (Array.isArray(res) && res.length > 0) {
      return res.map((j) => ({
        id: j.id ?? j.slug ?? "",
        title: j.title ?? "Role",
        category: j.category ?? "Technology",
        type: j.type ?? "Full-time",
        location: j.location ?? "Mumbai (Remote-friendly)",
        experience: j.experience ?? "",
        description: j.description ?? "",
        responsibilities: j.responsibilities ?? [],
        requirements: j.requirements ?? [],
        salaryRange: j.salaryRange ?? "",
        postedAt: j.postedAt ?? new Date().toISOString(),
      }))
    }
    return mockJobs
  } catch {
    return mockJobs
  }
}

export async function loadJob(id: string): Promise<Job | null> {
  const list = await loadJobs()
  return list.find((j) => j.id === id) ?? mockGetJobById(id) ?? null
}

export async function loadFaqs(): Promise<{ question: string; answer: string }[]> {
  try {
    const res = await fetchFaqs()
    if (Array.isArray(res) && res.length > 0) return res
    return mockFaqs
  } catch {
    return mockFaqs
  }
}

export async function loadTestimonials(): Promise<typeof mockTestimonials> {
  try {
    const res = await fetchTestimonials()
    const list = Array.isArray(res) ? (res as typeof mockTestimonials) : []
    if (!Array.isArray(list) || list.length === 0) return mockTestimonials
    // Ensure shape matches mock; if API returns different shape, fall back to mock entries where needed
    return list
      .map((t) => ({
        name: (t as unknown as { name?: string }).name ?? "",
        company: (t as unknown as { company?: string }).company ?? "",
        role: (t as unknown as { role?: string }).role ?? "",
        content: (t as unknown as { content?: string; quote?: string; text?: string }).content ??
          (t as unknown as { quote?: string }).quote ??
          (t as unknown as { text?: string }).text ??
          "",
        rating: (t as unknown as { rating?: number }).rating ?? 5,
      }))
      .filter((t) => t.name && t.content)
  } catch {
    return mockTestimonials
  }
}