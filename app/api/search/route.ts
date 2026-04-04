import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";
import { env } from "@/lib/env";

const exa = new Exa(env.EXA_API_KEY);

export async function POST(req: NextRequest) {
  const { query, numResults = 5 } = await req.json();

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const result = await exa.search(query.trim(), {
    numResults,
    contents: {
      highlights: { maxCharacters: 2000 },
    },
  });

  return NextResponse.json(result);
}
