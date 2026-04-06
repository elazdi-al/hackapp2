"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  MagicWand,
  Circle,
  Cursor,
  CaretDown,
  PaperPlaneTilt,
} from "phosphor-react"
import { Select } from "@base-ui/react/select"

const models = [
  { name: "Gemini 2.0 Flash", id: "google" },
  { name: "Gemini 1.5 Pro", id: "google" },
] as const

type ModelName = (typeof models)[number]["name"]

const modelIcons: Record<string, string> = {
  google: "https://svgl.app/library/gemini.svg",
}

export function AIPrompt() {
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState<ModelName>("Gemini 2.0 Flash")
  const router = useRouter()

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    router.push(`/search?id=${id}&q=${encodeURIComponent(trimmed)}`)
  }

  const selectedModelData = models.find((m) => m.name === selectedModel)

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
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
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            <PaperPlaneTilt size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
