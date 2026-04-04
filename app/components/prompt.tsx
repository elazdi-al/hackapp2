"use client"

import { useEffect, useState } from "react"
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
  ArrowSquareOut,
  SpinnerGap,
  PaperPlaneTilt,
} from "phosphor-react"
import { Select } from "@base-ui/react/select"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, ToolUIPart } from "ai"

interface Attachment {
  id: string
  name: string
  type: "pdf" | "image" | "folder" | "spreadsheet"
  meta?: string
  subMeta?: string
  preview?: string
}

const mockAttachments: Attachment[] = [
  { id: "1", name: "contract-agreement brief...", type: "pdf", meta: "93 lines" },
  { id: "2", name: "cloud.png", type: "image", preview: "bg-sky-200 dark:bg-sky-900/40" },
  { id: "3", name: "Documents", type: "folder", meta: "43 files", subMeta: "32 docs" },
  { id: "4", name: "Lead List", type: "spreadsheet", meta: "1023 rows", subMeta: "432 columns" },
]

const models = [
  { name: "Gemini 2.0 Flash", id: "google" },
  { name: "Gemini 1.5 Pro", id: "google" },
] as const

type ModelName = (typeof models)[number]["name"]

const modelIcons: Record<string, string> = {
  google: "https://svgl.app/library/gemini.svg",
}

const attachmentConfig = {
  pdf: { icon: FileText, label: "PDF", color: "#ef4444", weight: "duotone" as const },
  folder: { icon: FolderOpen, label: "Folder", color: "#f59e0b", weight: "fill" as const },
  spreadsheet: { icon: Rows, label: "Spreadsheet", color: "#22c55e", weight: "duotone" as const },
}

export function AIPrompt() {
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState<ModelName>("Gemini 2.0 Flash")
  const [attachments, setAttachments] = useState<Attachment[]>(mockAttachments)

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch(() => {})
  }, [setMessages])

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = () => {
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input })
    setInput("")
  }

  const selectedModelData = models.find((m) => m.name === selectedModel)
  const isLoading = status === "streaming" || status === "submitted"

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">

      {/* Message history */}
      <AnimatePresence initial={false}>
        {messages.map((message) =>
          message.parts?.map((part, i) => {
            if (part.type === "text") {
              return (
                <motion.div
                  key={`${message.id}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground self-end ml-12"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{part.text}</p>
                </motion.div>
              )
            }

            if (part.type?.startsWith("tool-")) {
              const toolPart = part as ToolUIPart
              return (
                <motion.div
                  key={`${message.id}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
                    <MagicWand size={13} weight="fill" className="text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {toolPart.type.replace("tool-", "")}
                    </span>
                    {toolPart.state === "input-available" && (
                      <SpinnerGap size={12} className="animate-spin text-muted-foreground ml-auto" />
                    )}
                  </div>

                  {toolPart.state === "output-available" && toolPart.output != null && (
                    <div className="p-3 flex flex-col gap-2">
                      {(toolPart.output as { results?: Array<{ title: string; url: string; highlights?: string[] }> } | null)
                        ?.results?.map((r, ri) => (
                        <a
                          key={ri}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col gap-0.5 rounded-lg p-2 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-foreground line-clamp-1">{r.title}</span>
                            <ArrowSquareOut size={11} weight="bold" className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {r.highlights?.[0] && (
                            <span className="text-[11px] text-muted-foreground line-clamp-2">{r.highlights[0]}</span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            }

            return null
          })
        )}
      </AnimatePresence>

      {/* Input box */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Describe your procurement need — product, quantity, budget, timeline..."
          className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[80px]"
          rows={2}
          disabled={isLoading}
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

          <Select.Root
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as ModelName)}
          >
            <Select.Trigger className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 pr-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors outline-none">
              {selectedModelData && (
                <img src={modelIcons[selectedModelData.id]} alt="" className="h-4 w-4 model-icon" />
              )}
              <Select.Value />
              <CaretDown size={12} weight="bold" className="text-muted-foreground" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner sideOffset={8} align="end" className="z-10">
                <Select.Popup className="min-w-[160px] rounded-xl border border-border bg-card p-1 shadow-lg outline-none">
                  {models.map((model) => (
                    <Select.Item
                      key={model.name}
                      value={model.name}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none cursor-default transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-foreground data-[selected]:bg-accent data-[selected]:text-foreground text-muted-foreground"
                    >
                      <img src={modelIcons[model.id]} alt="" className="h-4 w-4 model-icon" />
                      <Select.ItemText>{model.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            {isLoading ? (
              <SpinnerGap size={16} weight="bold" className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={16} weight="fill" />
            )}
          </button>
        </div>
      </div>

      {/* Attachments */}
      <div className={`flex gap-2.5 overflow-x-auto pb-2 min-h-[104px] ${attachments.length === 0 ? "invisible" : ""}`}>
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
                    <div className={`h-20 w-full rounded-lg ${attachment.preview || "bg-muted"} mb-2`} />
                    <p className="text-xs text-muted-foreground truncate">{attachment.name}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {config && <config.icon size={14} weight={config.weight} color={config.color} />}
                      <span className="text-[11px] text-muted-foreground font-medium">{config?.label}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-tight mb-0.5 truncate">{attachment.name}</p>
                    {attachment.meta && (
                      <p className="text-[11px] text-muted-foreground">
                        {attachment.meta}{attachment.subMeta && ` · ${attachment.subMeta}`}
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
