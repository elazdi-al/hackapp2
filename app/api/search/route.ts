import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse, tool } from "ai";
import { headers } from "next/headers";
import { z } from "zod";

import { mastra } from "@/mastra";
import { auth } from "@/lib/auth";
import { getChatResourceId } from "@/lib/chat-resource";

const addProviderTool = tool({
  description:
    "Emit a recommended provider card to display to the user. Call this once per provider you want to surface (exactly 6 in total). Call these before the final prose summary so cards appear first.",
  inputSchema: z.object({
    name: z.string().describe("Company name"),
    url: z.string().describe("Company website URL"),
    score: z.number().min(1).max(100).describe("Relevance score 1-100"),
    reasoning: z
      .string()
      .describe("1-2 sentence justification for this provider"),
  }),
  // Server-side no-op execute so Mastra returns a tool-result and the agent
  // continues to the next step (where it writes the prose summary). Without
  // an execute the call would be treated as a client-tool and the agent would
  // halt waiting for a client-side result.
  execute: async (input) => ({ ok: true, provider: input }),
});

export async function POST(req: Request) {
  const params = await req.json();
  const threadId = typeof params?.id === "string" ? params.id : "";

  if (!threadId || !Array.isArray(params?.messages)) {
    return new Response("Missing id or messages", { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const resourceId = getChatResourceId(session?.user?.id);

  const stream = await handleChatStream({
    mastra,
    agentId: "procurement-agent",
    version: "v6",
    params: {
      ...params,
      instructions: `You are Procora, an AI procurement decision assistant.

Workflow for every user query:
1. Call "supplier-search" 2-3 times with different angles (product, geography, company type) to gather real candidates.
2. Call "addProvider" exactly 6 times - one per top candidate - with name, url, score (1-100), and a 1-2 sentence reasoning. Do this before writing prose.
3. After emitting the 6 providers, write a short plain-text summary of 2-4 sentences explaining HOW you made the selection and WHAT the main criteria were (e.g. geography, product fit, company size, certifications, price signals). Do NOT describe or list the individual providers in this summary - the cards already cover that. No headings, no bullets, no provider names.

Never fabricate suppliers or URLs. Ground every provider in a real search result.`,
      memory: {
        ...params.memory,
        thread: threadId,
        resource: resourceId,
      },
      toolsets: {
        ...params.toolsets,
        extra: {
          addProvider: addProviderTool,
        },
      },
      maxSteps: typeof params.maxSteps === "number" ? params.maxSteps : 10,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createUIMessageStreamResponse({ stream: stream as any });
}
