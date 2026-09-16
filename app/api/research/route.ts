// DeepCite — SSE endpoint that streams the multi-agent pipeline in real time

import { NextRequest } from "next/server";
import { runPipeline } from "@backend/graph";
import type { SSEEvent } from "@backend/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = body?.query?.trim();

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing 'query' field" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await runPipeline(query, emit);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Pipeline failed";
        emit({ type: "agent_error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
