"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowSquareOut,
  SpinnerGap,
  CaretDown,
  Buildings,
  WarningCircle,
  Sparkle,
  X,
  Globe,
} from "phosphor-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Streamdown } from "streamdown"

import { useChatStore } from "@/lib/stores/chat-store"

interface Provider {
  name: string
  url: string
  score: number
  reasoning: string
}

// ── Sources panel ──────────────────────────────────────────────────────────────

function SourcesPanel({
  providers,
  visible,
  onClose,
  position,
}: {
  providers: Provider[]
  visible: boolean
  onClose: () => void
  position?: { left: number; top: number } | null
}) {
  if (!visible || !position) return null

  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ position: "fixed", top: position.top, left: position.left }}
      className="w-72 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-card shadow-lg z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Buildings size={14} weight="duotone" className="text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {providers.length} providers
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={12} weight="bold" />
        </button>
      </div>

      <div className="divide-y divide-border">
        {providers.map((p, i) => {
          const hostname = (() => {
            try { return new URL(p.url).hostname.replace(/^www\./, "") }
            catch { return p.url }
          })()
          return (
            <div key={i} className="px-4 py-3">
              <p className="text-sm font-medium text-foreground mb-0.5">
                {i + 1}. {p.name}
              </p>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5"
              >
                <Globe size={10} />
                {hostname} · {i + 1}
              </a>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {p.reasoning}
              </p>
            </div>
          )
        })}
      </div>
    </motion.aside>
  )
}

// ── Source chips row ───────────────────────────────────────────────────────────

function SourceChips({
  providers,
  onShowAll,
}: {
  providers: Provider[]
  onShowAll: () => void
}) {
  const visible = providers.slice(0, 3)
  const rest = providers.length - visible.length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkle size={14} weight="duotone" className="text-primary" />
        <span className="text-sm font-semibold text-foreground">Sources</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {visible.map((p, i) => {
          const hostname = (() => {
            try { return new URL(p.url).hostname.replace(/^www\./, "") }
            catch { return p.url }
          })()
          return (
            <motion.a
              key={i}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col gap-1 rounded-xl border border-border bg-card px-3 py-2.5 hover:bg-accent transition-colors min-w-[140px] max-w-[200px]"
            >
              <span className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                {p.name}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Globe size={10} />
                <span className="text-[11px] truncate">{hostname}</span>
              </div>
            </motion.a>
          )
        })}

        {rest > 0 && (
          <motion.button
            type="button"
            onClick={onShowAll}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: visible.length * 0.05 }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted px-4 py-2.5 min-h-[64px] hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <span className="text-xs font-medium">+{rest} more</span>
          </motion.button>
        )}

        <motion.button
          type="button"
          onClick={onShowAll}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (visible.length + 1) * 0.05 }}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-2.5 min-h-[64px] hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <div className="flex -space-x-1.5">
            {providers.slice(0, 4).map((_, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full bg-primary/20 border border-background ring-1 ring-border"
              />
            ))}
          </div>
          <span className="text-[11px] font-medium">Show all</span>
        </motion.button>
      </div>
    </div>
  )
}

// ── Streaming markdown reasoning ───────────────────────────────────────────────

function ReasoningSection({ markdown, isStreaming }: { markdown: string; isStreaming: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <Sparkle size={14} weight="duotone" className="text-primary" />
        <span className="text-sm font-semibold text-foreground">Procora</span>
      </div>
      <div className="text-base text-foreground/85 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
        <Streamdown
          mode={isStreaming ? "streaming" : "static"}
          parseIncompleteMarkdown
        >
          {markdown}
        </Streamdown>
      </div>
    </motion.div>
  )
}

// ── Provider card ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : score >= 60
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-red-500/10 text-red-500 dark:text-red-400"

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${color}`}>
      {score}
    </span>
  )
}

function ProviderCard({ provider, rank, pending }: { provider: Partial<Provider>; rank: number; pending?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const hostname = (() => {
    try { return provider.url ? new URL(provider.url).hostname.replace(/^www\./, "") : "" }
    catch { return provider.url ?? "" }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="text-xs font-semibold text-muted-foreground w-4 shrink-0 tabular-nums">
          {rank + 1}
        </span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {pending ? (
            <SpinnerGap size={14} weight="bold" className="animate-spin" />
          ) : (
            <Buildings size={15} weight="duotone" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {provider.name ?? "Loading provider…"}
          </p>
          {provider.url ? (
            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe size={10} />
              {hostname}
              <ArrowSquareOut size={9} weight="bold" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">…</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {typeof provider.score === "number" && <ScoreBadge score={provider.score} />}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              <CaretDown size={13} weight="bold" />
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && provider.reasoning && (
          <motion.div
            key="r"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed pt-3">
                {provider.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

type ToolPart = Extract<UIMessage["parts"][number], { type: `tool-${string}` }>

function extractFromAssistant(messages: UIMessage[]) {
  const assistant = [...messages].reverse().find((m) => m.role === "assistant")
  if (!assistant) return { providers: [] as Array<Partial<Provider> & { pending: boolean }>, markdown: "" }

  const providers: Array<Partial<Provider> & { pending: boolean }> = []
  let markdown = ""

  for (const part of assistant.parts) {
    if (part.type === "text") {
      markdown += part.text
      continue
    }
    if (part.type === "tool-addProvider") {
      const tp = part as ToolPart & { input?: Partial<Provider>; state: string }
      providers.push({
        ...(tp.input ?? {}),
        pending: tp.state !== "output-available" && tp.state !== "input-available",
      })
    }
  }

  return { providers, markdown }
}

// ── Root export ────────────────────────────────────────────────────────────────

export function SearchResults({
  chatId,
  query,
  initialMessages,
}: {
  chatId: string
  query: string
  initialMessages: UIMessage[]
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/search",
        // Send only what the server needs: the chat id + the message list.
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { id, messages },
        }),
      }),
    []
  )

  const { messages, sendMessage, status, error } = useChat({
    id: chatId,
    transport,
    messages: initialMessages,
  })

  const hydrateChat = useChatStore((s) => s.hydrate)
  const setConversation = useChatStore((s) => s.setConversation)
  const setVisibleMessages = useChatStore((s) => s.setVisibleMessages)
  const setStoreStatus = useChatStore((s) => s.setStatus)

  useEffect(() => {
    hydrateChat({
      conversation: { chatId, query },
      messages: initialMessages,
      status: "ready",
    })
  }, [chatId, query, initialMessages, hydrateChat])

  useEffect(() => {
    setConversation({ chatId, query })
    setVisibleMessages(messages)
    setStoreStatus(status)
  }, [chatId, query, messages, status, setConversation, setStoreStatus, setVisibleMessages])

  // Auto-send the query only on a fresh chat (no persisted messages).
  const sentRef = useRef<string | null>(null)
  useEffect(() => {
    if (!query || !chatId) return
    if (initialMessages.length > 0) return
    if (sentRef.current === chatId) return
    sentRef.current = chatId
    sendMessage({ text: query })
  }, [chatId, query, initialMessages.length, sendMessage])

  const { providers, markdown } = useMemo(() => extractFromAssistant(messages), [messages])

  // ── sources panel positioning ────────────────────────────────────────────────
  const [panelOpen, setPanelOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null)
  const SHIFT = 170

  useEffect(() => {
    if (!panelOpen || !contentRef.current) {
      return
    }
    const update = () => {
      const el = contentRef.current
      if (!el) return
      const untransformedRight = el.offsetLeft + el.offsetWidth
      const top = el.getBoundingClientRect().top
      setPanelPos({ left: untransformedRight + 24 - SHIFT, top: Math.max(96, top) })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update)
    }
  }, [panelOpen, providers.length])

  if (!query) return null

  const heading = (
    <h1
      className="text-5xl text-foreground leading-tight"
      style={{ fontFamily: "var(--font-instrument-serif)" }}
    >
      {query}
    </h1>
  )

  const isStreaming = status === "streaming" || status === "submitted"
  const nothingYet = providers.length === 0 && !markdown

  if (nothingYet && isStreaming) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {heading}
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <SpinnerGap size={26} weight="bold" className="animate-spin text-primary" />
          <p className="text-sm">Searching for the best providers…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {heading}
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <WarningCircle size={26} weight="duotone" className="text-destructive" />
          <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        ref={contentRef}
        animate={{ x: panelOpen ? -SHIFT : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-3xl mx-auto flex flex-col gap-8"
      >
        {heading}

        {providers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SourceChips
              providers={providers.filter((p) => !!(p.name && p.url && typeof p.score === "number" && p.reasoning)) as Provider[]}
              onShowAll={() => setPanelOpen((v) => !v)}
            />
          </motion.div>
        )}

        {providers.length > 0 && (
          <div className="flex flex-col gap-2">
            {providers.map((p, i) => (
              <ProviderCard key={`${p.url ?? "p"}-${i}`} provider={p} rank={i} pending={p.pending} />
            ))}
          </div>
        )}

        {markdown && <ReasoningSection markdown={markdown} isStreaming={isStreaming} />}
      </motion.div>

      <SourcesPanel
        providers={providers.filter((p) => !!(p.name && p.url && typeof p.score === "number" && p.reasoning)) as Provider[]}
        visible={panelOpen}
        onClose={() => setPanelOpen(false)}
        position={panelPos}
      />
    </>
  )
}
