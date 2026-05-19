"use client"

import { ReactNode } from "react"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children: ReactNode
  showNav?: boolean
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={showNav ? "pb-20" : ""}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
