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
} from "phosphor-react"

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

export function AIPrompt() {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<ModelName>("GPT 5.0")
  const [attachments, setAttachments] = useState<Attachment[]>(mockAttachments)
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
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

          <div className="flex-1" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 pr-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              {selectedModelData && (
                <img
                  src={modelIcons[selectedModelData.id]}
                  alt=""
                  className="h-4 w-4 opacity-70 dark:invert dark:opacity-80"
                />
              )}
              <span>{selectedModel}</span>
              <CaretDown size={12} weight="bold" className="text-muted-foreground" />
            </button>

            {showModelDropdown && (
              <div className="absolute top-11 right-0 z-10 min-w-[130px] rounded-xl border border-border bg-card p-1 shadow-lg">
                {models.map((model) => (
                  <button
                    type="button"
                    key={model.name}
                    onClick={() => {
                      setSelectedModel(model.name)
                      setShowModelDropdown(false)
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      selectedModel === model.name
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <img
                      src={modelIcons[model.id]}
                      alt=""
                      className="h-4 w-4 opacity-70 dark:invert dark:opacity-80"
                    />
                    <span>{model.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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