import type { ReactNode } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <DashboardNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}