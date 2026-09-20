import { completeChat } from "@/ai/ai-client"
import { runTool, type ToolContext } from "@/ai/tools/tools"
import { AppError } from "@/utils/api"
import { systemPrompt } from "@/ai/prompts/assistant"

export interface ChatRequest {
  message: string
  history?: { role: "user" | "assistant"; content: string }[]
}

export async function handleChat(input: ChatRequest, ctx: ToolContext) {
  const conversation: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: systemPrompt(ctx),
    },
    ...(input.history ?? []).slice(-10),
    { role: "user", content: input.message },
  ]

  const reply = await completeChat(conversation)

  const toolLines = reply
    .split("\n")
    .filter((line) => line.trim().startsWith("[TOOL:"))
    .map((line) => line.trim())

  if (toolLines.length === 0) {
    return { message: reply, toolResults: [] }
  }

  const toolResults = []
  const toolOutputs: { role: "assistant"; content: string }[] = []

  for (const line of toolLines) {
    const match = line.match(/\[TOOL:([a-z-]+)\](.*)/)
    if (!match) continue
    const name = match[1]
    const args: Record<string, unknown> = {}
    const argRegex = /(\w+)="([^"]*)"/g
    let am: RegExpExecArray | null
    while ((am = argRegex.exec(match[2])) !== null) {
      args[am[1]] = am[2]
    }

    try {
      const result = await runTool(name, args, ctx)
      toolResults.push({ name, result })
      toolOutputs.push({
        role: "assistant",
        content: `Tool ${name} returned: ${JSON.stringify(result, null, 2)}`,
      })
    } catch (err) {
      const message = err instanceof AppError ? err.message : "An error occurred"
      toolResults.push({ name, result: null, error: message })
      toolOutputs.push({
        role: "assistant",
        content: `Tool ${name} errored: ${message}`,
      })
    }
  }

  const finalConversation = [...conversation, ...toolOutputs]
  const finalReply = await completeChat(finalConversation as never)

  return { message: finalReply, toolResults }
}