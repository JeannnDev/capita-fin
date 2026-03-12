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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8 sm:space-y-12">

        {/* Global Controls */}
        {/* Global Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/60 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl">
           {/* Month Navigation */}
           <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded-[1.5rem] sm:rounded-[2.2rem] border border-white/5 shadow-inner grow lg:grow-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigateMonth("prev")} 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-primary/20 hover:text-primary transition-all shrink-0 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 flex items-center gap-2 sm:gap-4 px-2 sm:px-8 min-w-0 sm:min-w-[200px] justify-center text-foreground hover:bg-white/5 rounded-xl sm:rounded-2xl py-2 transition-all active:scale-[0.98] group">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs sm:text-base font-black capitalize tracking-tight truncate group-hover:text-primary transition-colors">{monthName}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[350px] p-5 rounded-[2rem] border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl" align="center">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Selecionar Período</h4>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                            onClick={() => {
                               const now = new Date()
                               setCurrentMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
                            }}
                         >
                            Ir para hoje
                         </Button>
                      </div>

                      <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded-2xl border border-white/5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl"
                          onClick={() => {
                            const [year, month] = currentMonth.split("-")
                            setCurrentMonth(`${parseInt(year) - 1}-${month}`)
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-black tracking-tighter tabular-nums">{currentMonth.split("-")[0]}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl"
                          onClick={() => {
                            const [year, month] = currentMonth.split("-")
                            setCurrentMonth(`${parseInt(year) + 1}-${month}`)
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, idx) => {
                          const isSelected = parseInt(currentMonth.split("-")[1]) === idx + 1
                          return (
                            <Button
                              key={m}
                              variant={isSelected ? "default" : "ghost"}
                              className={cn(
                                "h-11 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                                isSelected ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 hover:text-primary"
                              )}
                              onClick={() => {
                                const year = currentMonth.split("-")[0]
                                setCurrentMonth(`${year}-${String(idx + 1).padStart(2, "0")}`)
                              }}
                            >
                              {m}
                            </Button>
                          )
                        })}
                      </div>
                   </div>
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigateMonth("next")} 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-primary/20 hover:text-primary transition-all shrink-0 active:scale-95"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
           </div>

           {/* Account Selector */}
           <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-full lg:w-[320px] rounded-[1.5rem] sm:rounded-[2.2rem] bg-muted/20 border-white/5 h-14 sm:h-16 px-6 sm:px-8 font-black shadow-inner focus:ring-primary/20 text-foreground group transition-all hover:bg-muted/30">
              <div className="flex items-center gap-4">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:scale-110 transition-transform" />
                <SelectValue placeholder="Todas as contas" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-white/10 bg-background/80 backdrop-blur-3xl shadow-2xl p-2 min-w-[240px]">
              <SelectItem value="all" className="rounded-2xl p-4 font-black uppercase text-[10px] tracking-widest cursor-pointer">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="rounded-2xl p-4 font-black cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-4 rounded-full ring-2 ring-white/10 shadow-lg" style={{ backgroundColor: account.color }} />
                    <span className="text-sm tracking-tight">{account.name}</span>
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
        <div className="space-y-8 sm:space-y-12 relative before:absolute before:left-5 sm:before:left-7 before:top-8 before:bottom-8 before:w-[2px] before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
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
 
              return (
                <div key={day.date} className="relative pl-14 sm:pl-20 group">
                  {/* Balanced Timeline Pin */}
                  <div className="absolute left-0 top-0 h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center z-30">
                     <div className="h-9 w-9 sm:h-12 w-12 rounded-xl sm:rounded-2xl bg-background border-2 border-primary/20 shadow-xl flex flex-col items-center justify-center ring-4 ring-background transform group-hover:scale-110 group-hover:border-primary transition-all duration-500">
                        <span className="text-[7px] sm:text-[9px] font-black uppercase text-primary leading-none mb-0.5 sm:mb-1">{dayName.substring(0, 3)}</span>
                        <span className="text-sm sm:text-xl font-black text-foreground leading-none tabular-nums tracking-tighter">{dayNumber}</span>
                     </div>
                  </div>

                  {/* Proportional Daily Card */}
                  <Card className="glass-card border-border overflow-hidden shadow-2xl hover:border-primary/20 transition-all duration-500 py-0 gap-0">
                    {/* Header: Daily Flow Balance */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                       <div className="flex items-center gap-4 sm:gap-6">
                          <div className="flex flex-col gap-1">
                             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Fluxo do Dia</span>
                             <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                <span className="text-xs sm:text-sm font-black tabular-nums text-foreground/70 truncate">{formatCurrency(day.openingBalance)}</span>
                                <ArrowRight className="h-3 w-3 text-primary/30 shrink-0" />
                                <span className="text-xs sm:text-sm font-black tabular-nums text-primary truncate">{formatCurrency(day.closingBalance)}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Proportional Entries */}
                    <div className="divide-y divide-border/30">
                      {day.transactions.map((transaction) => (
                        <div key={transaction.id} className="group/row flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 hover:bg-muted/5 transition-all gap-4">
                          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                            <div className={cn(
                              "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl shadow-lg ring-1 transition-all",
                              transaction.type === "income" 
                                ? "bg-green-500/10 text-green-500 ring-green-500/10" 
                                : "bg-red-500/10 text-red-500 ring-red-500/10 shadow-red-500/5"
                            )}>
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5 sm:h-6 sm:w-6" />
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight group-hover/row:text-primary transition-colors truncate">{transaction.description}</span>
                              <div className="flex items-center gap-2 overflow-hidden">
                                 <div className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: transaction.type === 'income' ? '#22c55e' : '#ef4444' }} />
                                 <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.15em] truncate">{transaction.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-end sm:min-w-[140px] border-t sm:border-t-0 border-border/30 pt-3 sm:pt-0">
                             <span className={cn(
                                "text-xl sm:text-2xl font-black tabular-nums tracking-tighter leading-none",
                                transaction.type === "income" ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                             )}>
                                {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                             </span>
                             <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest sm:mt-2">Confirmada</span>
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
