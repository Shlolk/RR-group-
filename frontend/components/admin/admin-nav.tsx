"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  FileQuestion,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  Receipt,
  Send,
  Settings,
  Tags,
  Users,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sections: { label: string; items: { label: string; href: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Audit Logs", href: "/admin/audit", icon: BarChart3 },
    ],
  },
  {
    label: "Project Track",
    items: [
      { label: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Jobs", href: "/admin/jobs", icon: GraduationCap },
      { label: "Applications", href: "/admin/applications", icon: FileText },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Orders", href: "/admin/orders", icon: Receipt },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Invoices", href: "/admin/invoices", icon: FileText },
      { label: "Coupons", href: "/admin/coupons", icon: Boxes },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Leads", href: "/admin/leads", icon: Send },
      { label: "Newsletter", href: "/admin/newsletter", icon: Send },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Tickets", href: "/admin/support", icon: LifeBuoy },
      { label: "Queries", href: "/admin/inquiries", icon: FileQuestion },
      { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "FAQs", href: "/admin/faqs", icon: FileQuestion },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "ERP", href: "/admin/erp", icon: Building2 },
      { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Megaphone },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-row gap-1 lg:flex-col">
          <p className="hidden px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:block">
            {section.label}
          </p>
          {section.items.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:w-full",
                  active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}