import { createApp } from "@/app"
import { env } from "@/config/env"
import { isFirebaseConfigured } from "@/config/firebase"

async function bootstrap() {
  if (isFirebaseConfigured) {
    console.log("✅ Connected to Firebase (Cloud Firestore + Auth)")
  } else {
    console.warn("⚠️  Firebase is not fully configured — Firestore-backed endpoints may fail")
  }

  const app = createApp()

  app.listen(env.PORT, () => {
    console.log(`🚀 RR GROUP API running at ${env.BACKEND_URL}`)
    console.log(`   Frontend: ${env.FRONTEND_URL}`)
    console.log(`   Environment: ${env.NODE_ENV}`)
  })
}

bootstrap()