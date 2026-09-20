import type { Metadata } from "next"
import Link from "next/link"
import { AdminLoginForm } from "@/components/auth/admin-login-form"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Login — RR GROUP",
  description: "Staff and admin access to the RR GROUP management panel.",
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-600 font-display text-lg font-bold text-white">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff and administrator login. Customer accounts cannot access this panel.
          </p>
        </div>
        <AdminLoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not staff?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in as customer
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Need an admin account?{" "}
          <Link href="/admin/signup" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}