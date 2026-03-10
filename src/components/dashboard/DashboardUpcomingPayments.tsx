"use client"

import { Calendar, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, getRelativeDate, getFrequencyLabel } from "@/lib/format"
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Pagamentos futuros</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground" asChild>
          <Link href="/lembretes">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingReminders.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum pagamento pendente 🎉
          </p>
        ) : (
          upcomingReminders.map((reminder) => {
            const isOverdue = new Date(reminder.dueDate) < new Date()
            const color = getCategoryColor(reminder.category)

            return (
              <div
                key={reminder.id}
                className={cn(
                  "flex items-center justify-between rounded-lg p-3 transition-colors",
                  isOverdue ? "bg-destructive/10" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Calendar className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                        {getRelativeDate(reminder.dueDate)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getFrequencyLabel(reminder.frequency)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(reminder.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:bg-green-500/20 hover:text-green-500"
                    onClick={() => markReminderPaid(reminder.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
