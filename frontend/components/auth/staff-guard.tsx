"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export function StaffGuard({ children, skip }: { children: React.ReactNode; skip?: boolean }) {
  const { isAuthenticated, isStaff, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (skip || isLoginPage) return
    if (!loading && !isAuthenticated) {
      router.replace("/admin/login")
    } else if (!loading && !isStaff) {
      router.replace("/dashboard")
    }
  }, [loading, isAuthenticated, isStaff, router, skip, isLoginPage])

  if (skip || isLoginPage) return <>{children}</>
  if (loading || !isAuthenticated || !isStaff) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  return <>{children}</>
}