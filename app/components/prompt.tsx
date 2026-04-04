"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Plus,
  MagicWand,
  Circle,
  Cursor,
  X,
  FileText,
  FolderOpen,
  Rows,
  CaretDown,
  MagnifyingGlass,
  ArrowSquareOut,
  SpinnerGap,
} from "phosphor-react"
import { Select } from "@base-ui/react/select"

interface Attachment {
  id: string
  name: string
  type: "pdf" | "image" | "folder" | "spreadsheet"
  meta?: string
  subMeta?: string
  preview?: string
}

const mockAttachments: Attachment[] = [
  {
    id: "1",
    name: "contract-agreement brief...",
    type: "pdf",
    meta: "93 lines",
  },
  {
    id: "2",
    name: "cloud.png",
    type: "image",
    preview: "bg-sky-200 dark:bg-sky-900/40",
  },
  {
    id: "3",
    name: "Documents",
    type: "folder",
    meta: "43 files",
    subMeta: "32 docs",
  },
  {
    id: "4",
    name: "Lead List",
    type: "spreadsheet",
    meta: "1023 rows",
    subMeta: "432 columns",
  },
]

const models = [
  { name: "GPT 5.0", id: "openai" },
  { name: "GPT 4.5", id: "openai" },
  { name: "Claude 4", id: "claude" },
  { name: "Gemini 3", id: "gemini" },
] as const

type ModelName = (typeof models)[number]["name"]

const modelIcons: Record<string, string> = {
  openai: "https://svgl.app/library/openai_dark.svg",
  claude: "https://svgl.app/library/claude-ai-icon.svg",
  gemini: "https://svgl.app/library/gemini.svg",
}

const attachmentConfig = {
  pdf: {
    icon: FileText,
    label: "PDF",
    color: "#ef4444",
    weight: "duotone" as const,
  },
  folder: {
    icon: FolderOpen,
    label: "Folder",
    color: "#f59e0b",
    weight: "fill" as const,
  },
  spreadsheet: {
    icon: Rows,
    label: "Spreadsheet",
    color: "#22c55e",
    weight: "duotone" as const,
  },
}

interface SearchResult {
  title: string
  url: string
  publishedDate?: string | null
  author?: string | null
  highlights?: string[]
}

export function AIPrompt() {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<ModelName>("GPT 5.0")
  const [attachments, setAttachments] = useState<Attachment[]>(mockAttachments)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSearch = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Search failed")
      setResults(data.results ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const selectedModelData = models.find((m) => m.name === selectedModel)

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-border bg-card p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Add instructions from attached images..."
          className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[80px]"
          rows={2}
        />

        <div className="flex items-center gap-1 mt-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Add attachment"
          >
            <Plus size={18} weight="bold" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="AI suggestions"
          >
            <MagicWand size={18} weight="fill" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Circle tool"
          >
            <Circle size={18} weight="duotone" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Select tool"
          >
            <Cursor size={18} weight="bold" />
          </button>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !prompt.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Search with Exa"
          >
            {loading ? (
              <SpinnerGap size={18} weight="bold" className="animate-spin" />
            ) : (
              <MagnifyingGlass size={18} weight="bold" />
            )}
          </button>

          <div className="flex-1" />

          <Select.Root
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as ModelName)}
          >
            <Select.Trigger
              className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 pr-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors outline-none"
            >
              {selectedModelData && (
                <img
                  src={modelIcons[selectedModelData.id]}
                  alt=""
                  className="h-4 w-4 model-icon"
                />
              )}
              <Select.Value />
              <CaretDown size={12} weight="bold" className="text-muted-foreground" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner
                sideOffset={8}
                align="end"
                className="z-10"
              >
                <Select.Popup className="min-w-[130px] rounded-xl border border-border bg-card p-1 shadow-lg outline-none">
                  {models.map((model) => (
                    <Select.Item
                      key={model.name}
                      value={model.name}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none cursor-default transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-foreground data-[selected]:bg-accent data-[selected]:text-foreground text-muted-foreground"
                    >
                      <img
                        src={modelIcons[model.id]}
                        alt=""
                        className="h-4 w-4 model-icon"
                      />
                      <Select.ItemText>{model.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex flex-col gap-2"
          >
            {results.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border bg-card p-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">
                    {r.title}
                  </p>
                  <ArrowSquareOut
                    size={14}
                    weight="bold"
                    className="text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                {r.highlights?.[0] && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {r.highlights[0]}
                  </p>
                )}
                <p className="mt-1.5 text-[11px] text-muted-foreground/60 truncate">
                  {r.url}
                </p>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex gap-2.5 mt-3 overflow-x-auto pt-2 pb-2 min-h-[104px] ${attachments.length === 0 ? 'invisible' : ''}`}>
        <AnimatePresence mode="popLayout">
          {attachments.map((attachment) => {
            const config = attachmentConfig[attachment.type as keyof typeof attachmentConfig]

            return (
              <motion.div
                key={attachment.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="relative flex-shrink-0 w-40 rounded-xl border border-border bg-card p-3 group"
              >
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove attachment"
              >
                <X size={10} weight="bold" />
              </button>

              {attachment.type === "image" ? (
                <>
                  <div
                    className={`h-20 w-full rounded-lg ${attachment.preview || "bg-muted"} mb-2`}
                  />
                  <p className="text-xs text-muted-foreground truncate">{attachment.name}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {config && (
                      <config.icon
                        size={14}
                        weight={config.weight}
                        color={config.color}
                      />
                    )}
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {config?.label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium leading-tight mb-0.5 truncate">
                    {attachment.name}
                  </p>
                  {attachment.meta && (
                    <p className="text-[11px] text-muted-foreground">
                      {attachment.meta}
                      {attachment.subMeta && ` · ${attachment.subMeta}`}
                    </p>
                  )}
                </>
              )}
</motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}