"use client"

import { MessageCircle } from "lucide-react"
import { whatsappUrl, isWhatsAppConfigured } from "@/lib/whatsapp"

export { whatsappUrl }

export function WhatsAppButton() {
  if (!isWhatsAppConfigured) return null
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-20 z-50 flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  )
}