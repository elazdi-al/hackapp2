import { handleChatStream } from "@mastra/ai-sdk";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import { NextResponse } from "next/server";

const THREAD_ID = "procurement-thread";
const RESOURCE_ID = "procurement-chat";

export async function POST(req: Request) {
  const params = await req.json();

  const stream = await handleChatStream({
    mastra,
    agentId: "procurement-agent",
    params: {
      ...params,
      memory: {
        ...params.memory,
        thread: THREAD_ID,
        resource: RESOURCE_ID,
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createUIMessageStreamResponse({ stream: stream as any });
}

export async function GET() {
  const memory = await mastra.getAgentById("procurement-agent").getMemory();
  let response = null;

  try {
    response = await memory?.recall({
      threadId: THREAD_ID,
      resourceId: RESOURCE_ID,
    });
  } catch {
    // No previous messages
  }

  const uiMessages = toAISdkV5Messages(response?.messages || []);
  return NextResponse.json(uiMessages);
}
