"use client"

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function DashboardRecentTransactions() {
  const { transactions, categories } = useFinance()

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#8b5cf6"
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-black tracking-tight text-foreground">Transações Recentes</p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground mt-0.5">Últimas movimentações</p>
        </div>
        <Link
          href="/transacoes"
          className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15"
        >
          Ver todas
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 px-3 pb-3 space-y-0.5">
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-bold text-muted-foreground">Nenhuma transação</p>
          </div>
        ) : (
          recentTransactions.map((transaction, idx) => {
            const color = getCategoryColor(transaction.category)
            const isIncome = transaction.type === "income"

            return (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 transition-all hover:bg-accent group cursor-default",
                  idx !== recentTransactions.length - 1 && "border-b border-border/40"
                )}
              >
                {/* Icon + info */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl border border-black/5 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[100px] xs:max-w-[140px] leading-none">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="text-[9px] font-black uppercase tracking-tight truncate max-w-[60px] xs:max-w-none"
                        style={{ color }}
                      >
                        {transaction.category}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border shrink-0" />
                      <span className="text-[9px] text-muted-foreground font-bold shrink-0">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Value + badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-sm font-black tabular-nums leading-none",
                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      )}
                    >
                      {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded-full hidden lg:group-hover:block transition-all",
                      isIncome
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400"
                    )}
                  >
                    {isIncome ? "Entrada" : "Saída"}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
