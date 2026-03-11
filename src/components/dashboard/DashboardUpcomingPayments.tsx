"use client"

import { Calendar, Check, AlertCircle } from "lucide-react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, getRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function DashboardUpcomingPayments() {
  const { reminders, markReminderPaid, categories } = useFinance()

  const upcomingReminders = reminders
    .filter((r) => !r.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#8b5cf6"
  }

  const overdueCount = upcomingReminders.filter(r => new Date(r.dueDate) < new Date()).length

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-black tracking-tight text-foreground">Próximos Pagamentos</p>
            {overdueCount > 0 && (
              <div className="flex items-center gap-1 bg-red-500/15 text-red-600 dark:text-red-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                <AlertCircle className="h-2.5 w-2.5" />
                {overdueCount} atrasado{overdueCount > 1 ? "s" : ""}
              </div>
            )}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground mt-0.5">Compromissos agendados</p>
        </div>
        <Link
          href="/lembretes"
          className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15"
        >
          Ver todos
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 px-3 pb-3 space-y-0.5">
        {upcomingReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-bold text-muted-foreground">Sem pagamentos pendentes 🎉</p>
          </div>
        ) : (
          upcomingReminders.map((reminder, idx) => {
            const isOverdue = new Date(reminder.dueDate) < new Date()
            const color = getCategoryColor(reminder.category)

            return (
              <Link
                key={reminder.id}
                href={`/lembretes/${reminder.id}`}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 transition-all group",
                  idx !== upcomingReminders.length - 1 && "border-b border-border/40",
                  isOverdue
                    ? "bg-red-500/5 hover:bg-red-500/10"
                    : "hover:bg-accent"
                )}
              >
                {/* Icon + info */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: isOverdue ? "rgba(239,68,68,0.12)" : `${color}18`,
                      border: `1px solid ${isOverdue ? "rgba(239,68,68,0.2)" : `${color}25`}`
                    }}
                  >
                    <Calendar
                      className="h-4 w-4"
                      style={{ color: isOverdue ? "#f87171" : color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[130px] leading-none">{reminder.title}</p>
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-tight mt-1",
                      isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    )}>
                      {getRelativeDate(reminder.dueDate)}
                    </p>
                  </div>
                </div>

                {/* Value + action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "text-sm font-black tabular-nums",
                    isOverdue ? "text-red-600 dark:text-red-400" : "text-foreground"
                  )}>
                    {formatCurrency(reminder.amount)}
                  </span>
                  <button
                    onClick={() => markReminderPaid(reminder.id)}
                    title="Marcar como pago"
                    className="h-8 w-8 rounded-xl flex items-center justify-center bg-muted/20 text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
