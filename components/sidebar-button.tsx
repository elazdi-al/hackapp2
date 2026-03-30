"use client"

import { Button } from "@/components/ui/button"
import { SidebarSimple } from "phosphor-react"

export function SidebarButton() {
  return (
    <Button variant="ghost" size="icon">
      <SidebarSimple size={20} weight="fill" />
    </Button>
  )
}
