import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system:
        "You are a helpful AI assistant. Respond concisely and accurately to user queries. Format your responses using Markdown when appropriate.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
