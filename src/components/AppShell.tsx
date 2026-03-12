"use client"

import { type ReactNode } from "react"
import { AppSidebar } from "./NewAppSidebar"
import { AppHeader } from "./AppHeader"
import { useFinance } from "@/lib/finance-context"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AppShellProps {
  children: ReactNode
  title: string
}

export function AppShell({ children, title }: AppShellProps) {
  const { isSidebarOpen, setSidebarOpen, isLoading } = useFinance()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
                    <Loader2 className="absolute top-0 left-0 h-12 w-12 animate-spin text-primary" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                    Sincronizando Dados...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
