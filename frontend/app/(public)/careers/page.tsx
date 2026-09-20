import { loadJobs } from "@/lib/data"
import { CareersClient } from "./careers-client"

export const dynamic = "force-dynamic"

export default async function CareersPage() {
  const jobs = await loadJobs()
  return <CareersClient jobs={jobs} />
}
