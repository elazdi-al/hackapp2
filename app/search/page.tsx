import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import type { UIMessage } from "ai";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getChatResourceId } from "@/lib/chat-resource";
import { mastra } from "@/mastra";
import { SearchResults } from "./search-results";

interface Props {
  searchParams: Promise<{ q?: string; id?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, id } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <main className="min-h-svh">
        <div className="px-6 py-12" />
      </main>
    );
  }

  if (!id) {
    const newId = crypto.randomUUID();
    redirect(`/search?id=${newId}&q=${encodeURIComponent(query)}`);
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const resourceId = getChatResourceId(session?.user?.id);

  const memory = await mastra.getAgentById("procurement-agent").getMemory();
  let initialMessages: UIMessage[] = [];

  if (memory) {
    try {
      const recalled = await memory.recall({
        threadId: id,
        resourceId,
        perPage: false,
      });
      initialMessages = toAISdkV5Messages(recalled.messages) as unknown as UIMessage[];
    } catch {
      initialMessages = [];
    }
  }

  return (
    <main className="min-h-svh">
      <div className="px-6 py-12">
        <SearchResults
          chatId={id}
          query={query}
          initialMessages={initialMessages}
        />
      </div>
    </main>
  );
}

