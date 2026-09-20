"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/components/store/store-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop/products" },
  { label: "Categories", href: "/shop/categories" },
  { label: "Track Order", href: "/dashboard/orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

function Logo() {
  return (
    <Link href="/shop" className="flex items-center gap-2" aria-label="RR GROUP home">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold tracking-tight text-primary-foreground">
        RR
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-extrabold tracking-tight text-foreground">
          RR GROUP
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Store
        </span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { cartCount, wishlistCount } = useStore()
  const { user, isAuthenticated, isStaff, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/shop/search${query ? `?q=${encodeURIComponent(query)}` : ""}`)
    setSearchOpen(false)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-background",
      )}
    >
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium">
          Free priority setup on all software licenses this month
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

        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active = pathname === link.href
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

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-5" />
          </Button>
          <Link
            href="/shop/wishlist"
            aria-label="Wishlist"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <Heart className="size-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/shop/cart"
            aria-label="Cart"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated && user ? (
            <div className="relative ml-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="hidden sm:inline-flex"
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
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          <LayoutDashboard className="size-4" /> My Dashboard
                        </Link>
                        {isStaff && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <LayoutDashboard className="size-4" /> Admin Panel
                          </Link>
                        )}
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
                aria-label="Account"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden sm:inline-flex")}
              >
                <User className="size-5" />
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }), "ml-1 hidden sm:inline-flex")}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background"
          >
            <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl gap-2 px-4 py-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, categories, SKUs..."
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
                <Logo />
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
                {navLinks.map((link) => (
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
                    <Link
                      href="/dashboard"
                      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                    >
                      <LayoutDashboard className="size-4" /> My Dashboard
                    </Link>
                    {isStaff && (
                      <Link
                        href="/admin"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      >
                        <LayoutDashboard className="size-4" /> Admin Panel
                      </Link>
                    )}
                    <button className={buttonVariants({ variant: "ghost" })} onClick={logout}>
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                      <User className="size-4" /> Login
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
