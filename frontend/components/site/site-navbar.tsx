"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

const siteLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
]

export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isStaff, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-background",
      )}
    >
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium">
          Building digital solutions that drive business growth
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>

        <Link href="/" className="flex items-center gap-2" aria-label="RR GROUP home">
          <img
            src="/rrlogo.jpeg"
            alt="RR GROUP"
            width={36}
            height={36}
            className="size-9 rounded-lg object-contain bg-white p-1"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-extrabold tracking-tight text-foreground">
              RR GROUP
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Digital &amp; Business Solutions
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {siteLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </span>
              </Button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-border bg-card p-1.5 shadow-xl"
                    >
                      <div className="border-b border-border px-3 py-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {isStaff && (
                          <Link
                            href="/admin-panel"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
                          >
                            <LayoutDashboard className="size-4" /> Admin Panel
                          </Link>
                        )}
                        {isStaff && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <LayoutDashboard className="size-4" /> Classic Admin
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          <LayoutDashboard className="size-4" /> {isStaff ? "Customer View" : "My Dashboard"}
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="size-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
                Get Started
              </Link>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => router.push("/contact")}
          >
            Get a Quote
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-background p-4 shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <img src="/rrlogo.jpeg" alt="RR GROUP" width={36} height={36} className="size-9 rounded-lg object-contain bg-white p-1" />
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {siteLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 pt-6">
                {isAuthenticated && user ? (
                  <>
                    {isStaff && (
                      <Link
                        href="/admin-panel"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200")}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {isStaff && (
                      <Link
                        href="/admin"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      >
                        Classic Admin
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                    >
                      {isStaff ? "Customer View" : "My Dashboard"}
                    </Link>
                    <button className={buttonVariants({ variant: "ghost" })} onClick={logout}>
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                      Login
                    </Link>
                    <Link href="/register" className={cn(buttonVariants(), "w-full")}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}