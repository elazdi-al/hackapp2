"use client"

import { UserButton } from "@/components/user-button"

export function Header() {
  return (
    <header className="fixed top-0 right-0 z-50 p-4">
      <UserButton />
    </header>
  )
}
