"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "theme"

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeToDom(theme: Theme) {
  if (typeof document === "undefined") return
  const resolved = theme === "system" ? getSystemTheme() : theme
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const update = () => {
      const nextResolved = theme === "system" ? getSystemTheme() : theme
      setResolvedTheme(nextResolved)
      applyThemeToDom(theme)
    }
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}
