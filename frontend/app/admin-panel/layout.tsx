import type { ReactNode } from "react"
import { StaffGuard } from "@/components/auth/staff-guard"

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <StaffGuard>
      <div className="min-h-svh bg-[#0a0a0f] text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-4 px-6">
            <div className="flex items-center gap-3">
              <img src="/rrlogo.jpeg" alt="RR GROUP" width={32} height={32} className="size-8 rounded-lg object-contain bg-white p-1" />
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight text-white">RR GROUP — Admin Panel</p>
                <p className="text-[11px] uppercase tracking-widest text-white/50">Separate Command Center · Live Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/admin"
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                Classic Admin →
              </a>
              <a
                href="/"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#0a0a0f] hover:bg-white/90"
              >
                View Store
              </a>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-6 py-6">{children}</main>
      </div>
    </StaffGuard>
  )
}
