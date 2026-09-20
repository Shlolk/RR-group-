import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password — RR GROUP Store",
  description: "Set a new password for your RR GROUP account.",
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
            RR
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}