"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/AppShell"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatDate } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DaySummary {
  date: string
  openingBalance: number
  closingBalance: number
  income: number
  expenses: number
  transactions: {
    id: string
    description: string
    amount: number
    type: "income" | "expense"
    category: string
  }[]
}

export default function ExtratoPage() {
  const { transactions, accounts } = useFinance()
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const monthName = useMemo(() => {
    const [year, month] = currentMonth.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }, [currentMonth])

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    if (direction === "prev") date.setMonth(date.getMonth() - 1)
    else date.setMonth(date.getMonth() + 1)
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
  }

  const dailySummaries = useMemo<DaySummary[]>(() => {
    const [year, month] = currentMonth.split("-").map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    const filteredTransactions = transactions.filter((t) => {
      const transDate = new Date(t.date)
      const matchesMonth = transDate.getFullYear() === year && transDate.getMonth() === month - 1
      const matchesAccount = selectedAccount === "all" || t.accountId === selectedAccount
      return matchesMonth && matchesAccount
    })

    let runningBalance = selectedAccount === "all"
      ? accounts.reduce((sum, a) => sum + a.balance, 0)
      : accounts.find((a) => a.id === selectedAccount)?.balance || 0

    const currentMonthTransactions = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month - 1 &&
        (selectedAccount === "all" || t.accountId === selectedAccount)
    })

    currentMonthTransactions.forEach((t) => {
      if (t.type === "income") runningBalance -= t.amount
      else runningBalance += t.amount
    })

    const summaries: DaySummary[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayTransactions = filteredTransactions.filter((t) => t.date === dateStr)

      const openingBalance = runningBalance
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      const closingBalance = openingBalance + income - expenses
      runningBalance = closingBalance

      if (dayTransactions.length > 0) {
        summaries.push({
          date: dateStr,
          openingBalance,
          closingBalance,
          income,
          expenses,
          transactions: dayTransactions.map((t) => ({
            id: t.id, description: t.description, amount: t.amount, type: t.type, category: t.category,
          })),
        })
      }
    }

    return summaries.reverse()
  }, [currentMonth, selectedAccount, transactions, accounts])

  const monthSummary = useMemo(() => {
    const totalIncome = dailySummaries.reduce((sum, d) => sum + d.income, 0)
    const totalExpenses = dailySummaries.reduce((sum, d) => sum + d.expenses, 0)
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses }
  }, [dailySummaries])

  return (
    <AppShell title="Extrato">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Extrato</h1>
            <p className="text-sm text-muted-foreground">Acompanhe seu saldo dia a dia</p>
          </div>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between rounded-xl bg-card p-4 border">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-medium capitalize text-foreground">{monthName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Month Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receitas do mês</p>
                  <p className="text-xl font-semibold text-green-500">{formatCurrency(monthSummary.totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Despesas do mês</p>
                  <p className="text-xl font-semibold text-red-500">{formatCurrency(monthSummary.totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", monthSummary.balance >= 0 ? "bg-primary/10" : "bg-red-500/10")}>
                  <ArrowRightLeft className={cn("h-5 w-5", monthSummary.balance >= 0 ? "text-primary" : "text-red-500")} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo do mês</p>
                  <p className={cn("text-xl font-semibold", monthSummary.balance >= 0 ? "text-foreground" : "text-red-500")}>
                    {monthSummary.balance >= 0 ? "+" : ""}{formatCurrency(monthSummary.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Summaries */}
        <div className="space-y-4">
          {dailySummaries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">Nenhuma movimentação neste mês</p>
              </CardContent>
            </Card>
          ) : (
            dailySummaries.map((day) => {
              const dayDate = new Date(day.date + "T12:00:00")
              const dayName = dayDate.toLocaleDateString("pt-BR", { weekday: "long" })
              const dayNumber = dayDate.getDate()
              const dayDiff = day.closingBalance - day.openingBalance

              return (
                <Card key={day.date} className="overflow-hidden">
                  <CardHeader className="pb-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10">
                          <span className="text-lg font-bold text-primary">{dayNumber}</span>
                        </div>
                        <div>
                          <CardTitle className="text-base font-medium capitalize">{dayName}</CardTitle>
                          <p className="text-xs text-muted-foreground">{formatDate(day.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-lg font-semibold", dayDiff >= 0 ? "text-green-500" : "text-red-500")}>
                          {dayDiff >= 0 ? "+" : ""}{formatCurrency(dayDiff)}
                        </p>
                        <p className="text-xs text-muted-foreground">variação do dia</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex border-b bg-muted/10 px-4 py-3 text-sm">
                      <div className="flex-1">
                        <span className="text-muted-foreground">Saldo inicial:</span>
                        <span className="ml-2 font-medium text-foreground">{formatCurrency(day.openingBalance)}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-muted-foreground">Saldo final:</span>
                        <span className="ml-2 font-medium text-foreground">{formatCurrency(day.closingBalance)}</span>
                      </div>
                    </div>
                    <div className="divide-y">
                      {day.transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", transaction.type === "income" ? "bg-green-500/10" : "bg-red-500/10")}>
                              {transaction.type === "income" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{transaction.category}</p>
                            </div>
                          </div>
                          <span className={cn("text-sm font-semibold", transaction.type === "income" ? "text-green-500" : "text-red-500")}>
                            {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}
