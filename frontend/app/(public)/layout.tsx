import type { ReactNode } from "react"
import { SiteNavbar } from "@/components/site/site-navbar"
import { Footer } from "@/components/store/footer"
import { Chatbot } from "@/components/store/chatbot"
import { WhatsAppButton } from "@/components/site/whatsapp-button"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
      <WhatsAppButton />
    </div>
  )
}