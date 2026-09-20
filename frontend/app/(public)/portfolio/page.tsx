import { loadPortfolio } from "@/lib/data"
import { PortfolioClient } from "./portfolio-client"

export const dynamic = "force-dynamic"

export default async function PortfolioPage() {
  const projects = await loadPortfolio()
  return <PortfolioClient projects={projects} />
}
