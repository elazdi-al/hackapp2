import { SearchResults } from "./search-results"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  return (
    <main className="min-h-svh flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-3xl">
          {query && (
            <h1
              className="text-4xl mb-10 text-foreground leading-tight"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              {query}
            </h1>
          )}
          <SearchResults query={query} />
        </div>
      </div>
    </main>
  )
}
