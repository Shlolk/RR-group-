import { env } from "./env"

export interface AiClient {
  complete(messages: { role: "system" | "user" | "assistant"; content: string }[]): Promise<string>
}

export const aiConfig = {
  provider: env.AI_PROVIDER,
  apiKey: env.AI_API_KEY,
  model: env.AI_MODEL,
  enabled: Boolean(env.AI_API_KEY),
}

export function getAiConfig() {
  return aiConfig
}