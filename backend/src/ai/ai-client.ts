import { env } from "@/config/env"
import type { AiClient } from "@/config/ai"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ToolResult {
  name: string
  result: unknown
  error?: string
}

class OpenAICompatibleClient implements AiClient {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(provider: string, apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
    switch (provider) {
      case "groq":
        this.baseUrl = "https://api.groq.com/openai/v1"
        break
      case "openai":
        this.baseUrl = "https://api.openai.com/v1"
        break
      case "google":
        this.baseUrl = "https://generativelanguage.googleapis.com"
        break
      default:
        this.baseUrl = env.AI_BASE_URL || "https://api.openai.com/v1"
    }
  }

  async complete(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 700,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`AI provider error: ${response.status} ${text}`)
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return data.choices?.[0]?.message?.content ?? ""
  }
}

function createClient(): AiClient {
  const provider = env.AI_PROVIDER || "openai"
  const model = env.AI_MODEL || "gpt-4o-mini"
  return new OpenAICompatibleClient(provider, env.AI_API_KEY || "", model)
}

export async function completeChat(messages: ChatMessage[]): Promise<string> {
  const client = createClient()
  return client.complete(messages)
}

export function parseToolCalls(text: string): string[] {
  const regex = /\[TOOL:([a-z-]+)\]/g
  const calls: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    calls.push(match[1])
  }
  return calls
}