"use client"

import { type ReactNode } from "react"
import { AppSidebar } from "./NewAppSidebar"
import { AppHeader } from "./AppHeader"
import { useFinance } from "@/lib/finance-context"

interface AppShellProps {
  children: ReactNode
  title: string
}

export function AppShell({ children, title }: AppShellProps) {
  const { isSidebarOpen, setSidebarOpen } = useFinance()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
