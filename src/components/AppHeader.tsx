"use client"

import { Menu, Bell, Plus, PlayCircle } from "lucide-react"
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

interface AppHeaderProps {
  onMenuClick: () => void
  title: string
}

export function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  const { reminders } = useFinance()
  const { startTutorial } = useTutorial()
  const pendingReminders = reminders.filter((r) => !r.isPaid).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden md:flex gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
          onClick={startTutorial}
        >
          <PlayCircle className="h-4 w-4" />
          Testar Tutorial
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingReminders > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {pendingReminders}
                </span>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 text-sm font-semibold">Lembretes pendentes</div>
            {reminders
              .filter((r) => !r.isPaid)
              .slice(0, 5)
              .map((reminder) => (
                <DropdownMenuItem key={reminder.id} className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">{reminder.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(reminder.amount)} · Vence {reminder.dueDate}
                  </span>
                </DropdownMenuItem>
              ))}
            {pendingReminders === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhum lembrete pendente 🎉
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button id="header-add-button" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/transacoes">Nova transação</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/contas">Nova conta</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/lembretes">Novo lembrete</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/metas">Nova meta</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
