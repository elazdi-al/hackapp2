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
1. Search for real suppliers using the supplier-search tool (make 2–3 searches with different angles: by product type, by geography, by company size/type).
2. Analyze the results and write a global reasoning paragraph (2–4 sentences) explaining what criteria you prioritized and why, given the query context.
3. Select the top 3 provider candidates from your findings.

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.

The JSON must have:
- "summary": a 2–4 sentence paragraph explaining the key criteria considered and the overall procurement landscape for this query (string)
- "providers": array of exactly 3 objects, each with:
  - "name": company name (string)
  - "url": company website URL (string)
  - "score": relevance score 1–100 (number)
  - "reasoning": 1–2 sentence justification for this specific provider (string)

Procurement query: ${query}

Respond with ONLY the JSON object.`,
    { maxSteps: 6 }
  );

  const text = result.text.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse agent response" }, { status: 500 });
  }

  const data = JSON.parse(jsonMatch[0]);

  if (data.providers) {
    data.providers.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  }

  return NextResponse.json(data);
}
