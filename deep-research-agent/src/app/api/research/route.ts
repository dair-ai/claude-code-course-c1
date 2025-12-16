import { query } from "@anthropic-ai/claude-agent-sdk";
import { NextRequest } from "next/server";
import { researchAgentConfig } from "@/lib/agent/config";
import { RESEARCH_PROMPT_TEMPLATE } from "@/lib/agent/prompts";

export const maxDuration = 300; // 5 minutes max for deep research

export async function POST(request: NextRequest) {
  try {
    const { topic, sessionId } = await request.json();

    if (!topic || typeof topic !== "string") {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = RESEARCH_PROMPT_TEMPLATE(topic);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const message of query({
            prompt,
            options: {
              ...researchAgentConfig,
              resume: sessionId,
            }
          })) {
            // Send each message as a Server-Sent Event
            const data = JSON.stringify(message);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Signal completion
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", content: errorMessage })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
