"use client"

import { UserButton } from "@/components/user-button"
import { SidebarButton } from "@/components/sidebar-button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
      <SidebarButton />
      <UserButton />
    </header>
  )
}
