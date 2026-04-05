"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowSquareOut,
  SpinnerGap,
  CaretDown,
  Buildings,
  WarningCircle,
} from "phosphor-react"

interface Provider {
  name: string
  url: string
  score: number
  reasoning: string
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : score >= 60
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-red-500/10 text-red-600 dark:text-red-400"

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${color}`}>
      {score}
    </span>
  )
}

function ProviderCard({ provider, rank }: { provider: Provider; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  const hostname = (() => {
    try {
      return new URL(provider.url).hostname.replace(/^www\./, "")
    } catch {
      return provider.url
    }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Buildings size={18} weight="duotone" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground truncate">{provider.name}</span>
            <ScoreBadge score={provider.score} />
          </div>
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            {hostname}
            <ArrowSquareOut size={10} weight="bold" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={expanded ? "Collapse reasoning" : "Expand reasoning"}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <CaretDown size={14} weight="bold" />
          </motion.span>
        </button>
      </div>

      {/* Expandable reasoning */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="reasoning"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed pt-3">{provider.reasoning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function SearchResults({ query }: { query: string }) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) return

    setLoading(true)
    setError(null)
    setProviders([])

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Search failed")
        return r.json()
      })
      .then((data) => {
        setProviders(data.providers ?? [])
      })
      .catch(() => {
        setError("Something went wrong. Please try again.")
      })
      .finally(() => setLoading(false))
  }, [query])

  if (!query) return null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <SpinnerGap size={28} weight="bold" className="animate-spin text-primary" />
        <p className="text-sm">Finding the best providers for your request…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <WarningCircle size={28} weight="duotone" className="text-destructive" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (providers.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider, i) => (
        <ProviderCard key={provider.url || i} provider={provider} rank={i} />
      ))}
    </div>
  )
}
