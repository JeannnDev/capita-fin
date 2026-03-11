"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/AppShell"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wallet,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
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

  const monthData = useMemo(() => {
    const [year, month] = currentMonth.split("-").map(Number)
    return { year, month: month - 1 }
  }, [currentMonth])

  const { getStartingBalance } = useFinance()

  const dailySummaries = useMemo<DaySummary[]>(() => {
    const { year, month } = monthData
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const filteredTransactions = transactions.filter((t) => {
      const transDate = new Date(t.date)
      const matchesMonth = transDate.getFullYear() === year && transDate.getMonth() === month
      const matchesAccount = selectedAccount === "all" || t.accountId === selectedAccount
      return matchesMonth && matchesAccount
    })

    let currentRunningBalance = getStartingBalance(month, year, selectedAccount === "all" ? undefined : selectedAccount)

    const summaries: DaySummary[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayTransactions = filteredTransactions.filter((t) => {
        const d = new Date(t.date)
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
      })

      const openingBalance = currentRunningBalance
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      const closingBalance = openingBalance + income - expenses
      
      currentRunningBalance = closingBalance

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
  }, [monthData, selectedAccount, transactions, getStartingBalance])

  const monthSummary = useMemo(() => {
    const totalIncome = dailySummaries.reduce((sum, d) => sum + d.income, 0)
    const totalExpenses = dailySummaries.reduce((sum, d) => sum + d.expenses, 0)
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses }
  }, [dailySummaries])

  return (
    <AppShell title="Extrato">
      <div className="max-w-4xl mx-auto w-full px-6 py-6 space-y-12">

        {/* Global Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card p-4 rounded-[2.5rem] border border-border shadow-sm">
           {/* Month Navigation */}
           <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-[1.5rem] border border-border shadow-inner">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4 px-6 min-w-[180px] justify-center text-foreground/80">
                <Calendar className="h-4 w-4 text-primary/60" />
                <span className="text-sm font-black capitalize tracking-tight">{monthName}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                <ChevronRight className="h-5 w-5" />
              </Button>
           </div>

           {/* Account Selector */}
           <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-full sm:w-[280px] rounded-[1.5rem] bg-muted/40 border-border h-14 px-6 font-bold shadow-sm focus:ring-primary/20 text-foreground/80">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Todas as contas" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-card backdrop-blur-2xl shadow-2xl p-2">
              <SelectItem value="all" className="rounded-xl p-3 font-bold">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="rounded-xl p-3 font-bold">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full ring-2 ring-border shadow-sm" style={{ backgroundColor: account.color }} />
                    {account.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Analytics */}
        <PremiumBalanceCard
          title="Consolidado do Mês"
          amount={formatCurrency(monthSummary.balance)}
          icon={ArrowRightLeft}
          className="shadow-2xl"
          secondaryMetrics={[
            {
              label: "Entradas",
              value: formatCurrency(monthSummary.totalIncome),
              icon: TrendingUp,
              trend: "up"
            },
            {
              label: "Saídas",
              value: formatCurrency(monthSummary.totalExpenses),
              icon: TrendingDown,
              trend: "down"
            }
          ]}
        />

        {/* Daily Summaries Timeline */}
        <div className="space-y-12 relative before:absolute before:left-7 before:top-8 before:bottom-8 before:w-[2px] before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
          {dailySummaries.length === 0 ? (
            <Card className="border-dashed bg-transparent shadow-none border-border p-20 text-center col-span-full">
              <div className="flex flex-col items-center gap-6">
                 <div className="p-8 rounded-full bg-muted/10 ring-1 ring-border shadow-inner">
                   <Wallet className="h-12 w-12 text-muted-foreground/20" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight text-foreground">Sem rastro financeiro</h3>
                    <p className="mt-1 text-sm font-bold text-muted-foreground/60 uppercase tracking-widest text-wrap">Nenhuma movimentação identificada neste período</p>
                 </div>
              </div>
            </Card>
          ) : (
            dailySummaries.map((day) => {
              const dayDate = new Date(day.date + "T12:00:00")
              const dayName = dayDate.toLocaleDateString("pt-BR", { weekday: "long" })
              const dayNumber = dayDate.getDate()
              const variation = day.closingBalance - day.openingBalance
 
              return (
                <div key={day.date} className="relative pl-20 group">
                  {/* Balanced Timeline Pin */}
                  <div className="absolute left-0 top-0 h-14 w-14 flex items-center justify-center z-30">
                     <div className="h-12 w-12 rounded-2xl bg-background border-2 border-primary/20 shadow-xl flex flex-col items-center justify-center ring-4 ring-background transform group-hover:scale-110 group-hover:border-primary transition-all duration-500">
                        <span className="text-[9px] font-black uppercase text-primary leading-none mb-1">{dayName.substring(0, 3)}</span>
                        <span className="text-xl font-black text-foreground leading-none tabular-nums tracking-tighter">{dayNumber}</span>
                     </div>
                  </div>

                  {/* Proportional Daily Card */}
                  <Card className="glass-card border-border overflow-hidden shadow-2xl hover:border-primary/20 transition-all duration-500 py-0 gap-0">
                    {/* Header: Daily Flow Balance */}
                    <div className="px-6 py-4 border-b border-border bg-muted/5 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col gap-1">
                             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Fluxo do Dia</span>
                             <div className="flex items-center gap-4">
                                <span className="text-sm font-black tabular-nums text-foreground/70">{formatCurrency(day.openingBalance)}</span>
                                <ArrowRight className="h-3 w-3 text-primary/30" />
                                <span className="text-sm font-black tabular-nums text-primary">{formatCurrency(day.closingBalance)}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Proportional Entries */}
                    <div className="divide-y divide-border/30">
                      {day.transactions.map((transaction) => (
                        <div key={transaction.id} className="group/row flex items-center justify-between px-6 py-5 hover:bg-muted/5 transition-all">
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ring-1 transition-all",
                              transaction.type === "income" 
                                ? "bg-green-500/10 text-green-500 ring-green-500/10" 
                                : "bg-red-500/10 text-red-500 ring-red-500/10 shadow-red-500/5"
                            )}>
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="h-6 w-6" />
                              ) : (
                                <ArrowDownRight className="h-6 w-6" />
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-lg font-black text-foreground uppercase tracking-tight group-hover/row:text-primary transition-colors">{transaction.description}</span>
                              <div className="flex items-center gap-2">
                                 <div className="h-1 w-1 rounded-full" style={{ backgroundColor: transaction.type === 'income' ? '#22c55e' : '#ef4444' }} />
                                 <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.15em]">{transaction.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end min-w-[140px]">
                             <span className={cn(
                                "text-2xl font-black tabular-nums tracking-tighter leading-none",
                                transaction.type === "income" ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                             )}>
                                {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                             </span>
                             <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest mt-2">Movimentação Confirmada</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}
