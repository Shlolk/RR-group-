"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isStaff, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login?next=/admin")
    } else if (!loading && !isStaff) {
      router.replace("/dashboard")
    }
  }, [loading, isAuthenticated, isStaff, router])

  if (loading || !isAuthenticated || !isStaff) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  return <>{children}</>
}