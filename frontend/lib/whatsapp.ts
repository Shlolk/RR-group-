// Company WhatsApp number — digits only with country code.
// Configure via NEXT_PUBLIC_WHATSAPP_NUMBER; falls back to the footer contact number.
const FALLBACK_WHATSAPP_NUMBER = "919938844331"
const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") || ""
export const isWhatsAppConfigured = Boolean(rawNumber)
const WHATSAPP_NUMBER = rawNumber || FALLBACK_WHATSAPP_NUMBER

export function whatsappUrl(message?: string) {
  if (!isWhatsAppConfigured && typeof window !== "undefined") {
    console.warn(
      "[whatsapp] NEXT_PUBLIC_WHATSAPP_NUMBER is not configured — using fallback number. Set NEXT_PUBLIC_WHATSAPP_NUMBER to a valid number or hide the WhatsApp button.",
    )
  }
  const text = message
    ? encodeURIComponent(message)
    : encodeURIComponent("Hello RR GROUP, I'd like to know more about your services.")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
