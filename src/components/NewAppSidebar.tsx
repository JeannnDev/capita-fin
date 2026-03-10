"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Bell,
  PieChart,
  Settings,
  Target,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, id: "sidebar-nav-dashboard" },
  { name: "Contas", href: "/contas", icon: Wallet, id: "sidebar-nav-contas" },
  { name: "Transações", href: "/transacoes", icon: Receipt, id: "sidebar-nav-transacoes" },
  { name: "Extrato", href: "/extrato", icon: FileText, id: "sidebar-nav-extrato" },
  { name: "Lembretes", href: "/lembretes", icon: Bell, id: "sidebar-nav-lembretes" },
  { name: "Orçamento", href: "/orcamento", icon: PieChart, id: "sidebar-nav-orcamento" },
]

const secondaryNav = [
  { name: "Metas", href: "/metas", icon: Target, id: "sidebar-nav-metas" },
]

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-bold text-sidebar-foreground">CapitaFin</span>
            <p className="text-[10px] text-muted-foreground">Gestão financeira</p>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Principal
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                id={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            )
          })}

          <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Planejamento
          </div>
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                id={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/configuracoes"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              pathname === "/configuracoes"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}
          >
            <Settings className="h-4.5 w-4.5" />
            Configurações
          </Link>
        </div>
      </aside>
    </>
  )
}
