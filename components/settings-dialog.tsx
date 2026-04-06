"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { AnimatePresence, motion } from "motion/react"
import {
  X,
  Sun,
  Moon,
  Monitor,
  Check,
  User,
  Palette,
  Camera,
  type IconWeight,
} from "phosphor-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useTheme } from "@/components/theme-provider"

type Section = "account" | "appearance"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeSection, setActiveSection] = React.useState<Section>("account")

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal keepMounted>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Backdrop
                render={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
                  />
                }
              />
              <Dialog.Popup
                render={<motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none outline-none"
              >
                <div className="pointer-events-auto relative w-full max-w-[620px] h-[480px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden flex">
                  <Dialog.Title className="sr-only">Settings</Dialog.Title>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="absolute top-3.5 right-3.5 z-10 flex items-center justify-center size-6 rounded-full bg-muted hover:bg-accent transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={11} weight="bold" className="text-muted-foreground" />
                  </button>

                  {/* Sidebar */}
                  <div className="w-[168px] shrink-0 border-r border-border bg-muted/40 flex flex-col p-3 pt-4 gap-1">
                    <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">
                      Settings
                    </p>
                    <NavItem
                      icon={User}
                      label="Account"
                      active={activeSection === "account"}
                      onClick={() => setActiveSection("account")}
                    />
                    <NavItem
                      icon={Palette}
                      label="Appearance"
                      active={activeSection === "appearance"}
                      onClick={() => setActiveSection("appearance")}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {activeSection === "account" && (
                        <SectionShell key="account">
                          <AccountSection />
                        </SectionShell>
                      )}
                      {activeSection === "appearance" && (
                        <SectionShell key="appearance">
                          <AppearanceSection />
                        </SectionShell>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Dialog.Popup>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ─── Nav item ────────────────────────────────────────────────────────────────── */

const NavItem = React.memo(function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; weight?: IconWeight; className?: string }>
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm w-full transition-colors cursor-pointer",
        active
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Icon size={15} weight={active ? "fill" : "regular"} className="shrink-0" />
      {label}
    </button>
  )
})

/* ─── Section shell ───────────────────────────────────────────────────────────── */

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="p-6"
    >
      {children}
    </motion.div>
  )
}

/* ─── Account section ─────────────────────────────────────────────────────────── */

function AccountSection() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  const [firstName, setFirstName] = React.useState(user?.name?.split(" ")[0] ?? "")
  const [lastName, setLastName] = React.useState(user?.name?.split(" ").slice(1).join(" ") ?? "")
  const [imagePreview, setImagePreview] = React.useState<string | null>(user?.image ?? null)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync if session loads after mount
  React.useEffect(() => {
    if (user) {
      setFirstName(user.name?.split(" ")[0] ?? "")
      setLastName(user.name?.split(" ").slice(1).join(" ") ?? "")
      setImagePreview(user.image ?? null)
    }
  }, [user?.id])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    const name = `${firstName} ${lastName}`.trim()
    await authClient.updateUser({
      name,
      image: imagePreview ?? undefined,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = firstName?.[0]?.toUpperCase() ?? user?.name?.[0]?.toUpperCase() ?? "?"

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-0.5">Account</h3>
      <p className="text-xs text-muted-foreground mb-6">Your personal information.</p>

      <div className="space-y-4">
        {/* Avatar */}
        <div>
          <p className="text-xs font-medium text-foreground mb-2">Profile picture</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group size-12 rounded-full border border-border overflow-hidden cursor-pointer shrink-0"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={14} weight="bold" className="text-white" />
              </div>
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-foreground hover:underline underline-offset-2 cursor-pointer"
              >
                Upload photo
              </button>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <EditableField label="First name" value={firstName} onChange={setFirstName} placeholder="Jane" />
          <EditableField label="Last name" value={lastName} onChange={setLastName} placeholder="Doe" />
        </div>

        {/* Email — read-only */}
        <div>
          <p className="text-xs font-medium text-foreground mb-1.5">Email</p>
          <div className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-9 flex items-center cursor-not-allowed select-none">
            {user?.email ?? "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              saved
                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {saved ? (
              <><Check size={14} weight="bold" /> Saved</>
            ) : saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 min-h-9"
      />
    </div>
  )
}

/* ─── Appearance section ──────────────────────────────────────────────────────── */

function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-0.5">Appearance</h3>
      <p className="text-xs text-muted-foreground mb-6">
        Choose a fixed theme or follow your system.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {options.map(({ value, label, icon: Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "relative rounded-xl border-2 p-3 transition-colors cursor-pointer text-left",
                active
                  ? "border-primary"
                  : "border-border hover:border-ring"
              )}
            >
              <div className={cn(
                "w-full h-16 mb-2.5 rounded-lg flex items-center justify-center",
                value === "light" && "bg-gray-100",
                value === "dark" && "bg-gray-900",
                value === "system" && "bg-gradient-to-br from-gray-100 to-gray-900",
              )}>
                <Icon
                  size={20}
                  weight="fill"
                  className={cn(
                    value === "light" && "text-amber-500",
                    value === "dark" && "text-purple-300",
                    value === "system" && "text-white mix-blend-difference",
                  )}
                />
              </div>
              <span className="text-xs font-medium text-foreground">{label}</span>
              {active && (
                <div className="absolute bottom-2.5 right-2.5 size-4 bg-primary rounded-full flex items-center justify-center">
                  <Check size={9} weight="bold" className="text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
