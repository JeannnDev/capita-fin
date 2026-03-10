"use client"

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function DashboardRecentTransactions() {
  const { transactions, categories } = useFinance()

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#8b5cf6"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Transações recentes</CardTitle>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground" asChild>
          <Link href="/transacoes">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((transaction) => {
          const color = getCategoryColor(transaction.category)
          const isIncome = transaction.type === "income"

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="h-4 w-4" style={{ color }} />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" style={{ color }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category} · {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isIncome ? "text-green-500" : "text-foreground"
                )}
              >
                {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
