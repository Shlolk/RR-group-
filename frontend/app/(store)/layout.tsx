import type { ReactNode } from "react"
import { Navbar } from "@/components/store/navbar"
import { Footer } from "@/components/store/footer"
import { Chatbot } from "@/components/store/chatbot"

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  )
}
