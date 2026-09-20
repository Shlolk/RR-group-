import { loadServices } from "@/lib/data"
import { ContactClient } from "./contact-client"

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const services = await loadServices()
  return <ContactClient services={services} />
}
