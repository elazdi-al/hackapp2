import { mastra } from "@/mastra";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const agent = mastra.getAgentById("procurement-agent");

  const result = await agent.generate(
    `You are given a procurement query. Your job is to:
1. Search for real suppliers using the supplier-search tool (make 2–3 searches with different angles).
2. From your findings, select the top 3 provider candidates.
3. Return ONLY a valid JSON array with exactly 3 objects. Do not include any explanation, markdown, or extra text.

Each object must have:
- "name": company name (string)
- "url": company website URL (string)
- "score": relevance score 1–100 (number)
- "reasoning": 1–2 sentence justification (string)

Procurement query: ${query}

Respond with ONLY the JSON array.`,
    { maxSteps: 5 }
  );

  const text = result.text.trim();

  // Extract JSON array from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse agent response" }, { status: 500 });
  }

  const providers = JSON.parse(jsonMatch[0]);

  // Sort by score descending
  providers.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  return NextResponse.json({ providers });
}
