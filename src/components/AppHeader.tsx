"use client"

import { Menu, Bell, Plus, PlayCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTutorial } from "@/lib/tutorial-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface AppHeaderProps {
  onMenuClick: () => void
  title: string
}

export function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  const { reminders } = useFinance()
  const { startTutorial } = useTutorial()
  const pendingReminders = reminders.filter((r) => !r.isPaid).length

  return (
    <header
      className="sticky top-0 z-30 flex h-[72px] items-center justify-between px-5 lg:px-8 bg-background/80 backdrop-blur-xl border-b border-border/40"
    >
      {/* ── Left: mobile burger + title ── */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground leading-none truncate max-w-[120px] xs:max-w-[200px] sm:max-w-none">{title}</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.16em] font-bold hidden sm:block mt-0.5">
            Gerenciamento Financeiro
          </p>
        </div>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2">

        {/* Theme Toggle */}
        <div className="hidden sm:block mr-2">
          <ThemeToggle />
        </div>

        {/* Search — decorative, could later be wired up */}
        <button className="hidden md:flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all border border-border/50">
          <Search className="h-4 w-4" />
          <span className="text-xs">Buscar...</span>
        </button>

        {/* Tutorial */}
        <button
          className="hidden md:flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all border border-border/50"
          onClick={startTutorial}
        >
          <PlayCircle className="h-4 w-4 text-violet-400" />
          <span className="text-xs">Guia Rápido</span>
        </button>

        {/* Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all border border-border/50">
              <Bell className="h-4 w-4" />
              {pendingReminders > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-background">
                  {pendingReminders}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 rounded-2xl p-2 mt-2 shadow-2xl bg-card border-border border-opacity-50"
          >
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 mb-1">
              Lembretes pendentes
            </div>
            {reminders
              .filter((r) => !r.isPaid)
              .slice(0, 5)
              .map((reminder) => (
                <DropdownMenuItem
                  key={reminder.id}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl hover:bg-accent cursor-pointer focus:bg-accent transition-colors"
                >
                  <span className="font-bold text-sm text-foreground">{reminder.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-violet-400">{formatCurrency(reminder.amount)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground font-medium">Vence {reminder.dueDate}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            {pendingReminders === 0 && (
              <div className="px-4 py-8 text-center flex flex-col items-center gap-2 opacity-40">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs font-bold text-muted-foreground">Nenhum lembrete pendente 🎉</p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create new */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id="header-add-button"
              className="gap-2 rounded-xl px-3 sm:px-4 h-9 font-bold premium-gradient text-white border-none shadow-lg shadow-violet-900/30 hover:opacity-90 active:scale-95 transition-all focus:ring-0 focus:outline-none"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Criar Novo</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl p-2 mt-2 shadow-2xl min-w-[180px] bg-card border-border border-opacity-50"
          >
            {[
              { label: "Transação",       href: "/transacoes" },
              { label: "Conta Bancária",  href: "/contas"     },
              { label: "Lembrete",        href: "/lembretes"  },
              { label: "Meta de Economia",href: "/metas"      },
            ].map((item) => (
              <DropdownMenuItem key={item.href} asChild className="rounded-xl p-3 focus:bg-accent cursor-pointer transition-colors">
                <Link href={item.href} className="flex items-center gap-2 font-bold text-sm w-full text-foreground">
                  <Plus className="h-4 w-4 text-violet-400" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
