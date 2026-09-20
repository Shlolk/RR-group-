"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, LayoutDashboard, LifeBuoy, MapPin, Package, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Invoices", href: "/dashboard/invoices", icon: CreditCard },
  { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { label: "Profile", href: "/dashboard/profile", icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col" aria-label="Dashboard">
      {links.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}