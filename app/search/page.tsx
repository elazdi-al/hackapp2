import { SearchResults } from "./search-results"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  return (
    <main className="min-h-svh">
      <div className="px-6 py-12">
        <SearchResults query={query} />
      </div>
    </main>
  )
}
