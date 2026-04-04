import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY!);

export const supplierSearchTool = createTool({
  id: "supplier-search",
  description:
    "Search the web for real supplier or product candidates matching a procurement request. Use this to find vendors, pricing, availability, and company information.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "A targeted search query to find relevant suppliers or products. Be specific: include product category, specs, geography, and any constraints."
      ),
    numResults: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("Number of supplier results to return"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        publishedDate: z.string().nullable().optional(),
        highlights: z.array(z.string()).optional(),
      })
    ),
  }),
  execute: async ({ query, numResults }) => {
    const result = await exa.search(query, {
      numResults,
      contents: {
        highlights: { maxCharacters: 2000 },
      },
    });

    return {
      results: result.results.map((r) => ({
        title: r.title ?? "",
        url: r.url,
        publishedDate: r.publishedDate ?? null,
        highlights: r.highlights ?? [],
      })),
    };
  },
});
