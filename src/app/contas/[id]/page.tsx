"use client"

import React, { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Wallet, 
  Building2, 
  CreditCard, 
  UtensilsCrossed, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search
} from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, getRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
import { format, startOfMonth, endOfMonth } from "date-fns"

const accountIcons: Record<string, typeof Wallet> = {
  wallet: Wallet,
  checking: Building2,
  savings: Building2,
  credit: CreditCard,
  food: UtensilsCrossed,
}

const accountTypeLabels: Record<string, string> = {
  wallet: "Carteira",
  checking: "Conta corrente",
  savings: "Poupança",
  credit: "Cartão de crédito",
  food: "Vale alimentação",
}

export default function AccountDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { accounts, transactions, getStartingBalance } = useFinance()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<{ start?: Date; end?: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

  const account = useMemo(() => accounts.find(a => a.id === id), [accounts, id])
  
  const accountTransactions = useMemo(() => {
    return transactions
      .filter(t => t.accountId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, id])

  const filteredTransactions = useMemo(() => {
    return accountTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const isInRange = (!dateFilter.start || transactionDate >= dateFilter.start) && 
                        (!dateFilter.end || transactionDate <= dateFilter.end)
      
      return matchesSearch && isInRange
    })
  }, [accountTransactions, searchTerm, dateFilter])

  const stats = useMemo(() => {
    const month = dateFilter.start ? dateFilter.start.getMonth() : new Date().getMonth()
    const year = dateFilter.start ? dateFilter.start.getFullYear() : new Date().getFullYear()

    const startingBalance = getStartingBalance(month, year, id)
    
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
      
    return { 
      income, 
      expense, 
      periodResult: income - expense,
      startingBalance,
      endingBalance: startingBalance + (income - expense)
    }
  }, [filteredTransactions, dateFilter.start, id, getStartingBalance])

  if (!account) {
    return (
      <AppShell title="Conta não encontrada">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">A conta que você está procurando não existe ou foi removida.</p>
          <Button onClick={() => router.push("/contas")}>Voltar para Contas</Button>
        </div>
      </AppShell>
    )
  }

  const Icon = accountIcons[account.type] || Wallet

  return (
    <AppShell title={`Detalhes: ${account.name}`}>
      <div className="space-y-8 max-w-[1200px] mx-auto">
        {/* Header & Main Balance */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 px-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/contas")}
              className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Visualizando Detalhes da Conta</span>
              <p className="text-xs font-bold text-muted-foreground/60 tracking-tight">{account.institution || 'Instituição não informada'} • {accountTypeLabels[account.type]}</p>
            </div>
          </div>

          <PremiumBalanceCard
            title="Saldo Disponível"
            amount={formatCurrency(account.balance)}
            icon={Icon}
            color={account.color}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-card border-white/10 shadow-xl shadow-emerald-500/5 group hover:bg-emerald-500/[0.02] transition-all">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entradas</span>
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight text-emerald-500">{formatCurrency(stats.income)}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tight">No período selecionado</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 shadow-xl shadow-rose-500/5 group hover:bg-rose-500/[0.02] transition-all">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Saídas</span>
                <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover:-rotate-12 transition-transform">
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight text-rose-500">{formatCurrency(stats.expense)}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tight">No período selecionado</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 shadow-xl shadow-primary/5 group hover:bg-primary/[0.02] transition-all sm:col-span-2 lg:col-span-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resultado</span>
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center transition-transform",
                  stats.periodResult >= 0 ? "bg-primary/10 group-hover:rotate-12" : "bg-orange-500/10 group-hover:-rotate-12"
                )}>
                  {stats.periodResult >= 0 ? <ArrowUpRight className="h-5 w-5 text-primary" /> : <ArrowDownLeft className="h-5 w-5 text-orange-500" />}
                </div>
              </div>
              <p className={cn(
                "text-3xl font-black tracking-tight",
                stats.periodResult >= 0 ? "text-primary" : "text-orange-500"
              )}>{formatCurrency(stats.periodResult)}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tight">Saldo Final: {formatCurrency(stats.endingBalance)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 md:p-8 rounded-[2rem] border-white/5 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Buscar Movimentação</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Descrição ou categoria..." 
                  className="pl-12 bg-muted/20 border-white/10 h-14 rounded-2xl text-base font-bold focus:ring-primary/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:w-[460px]">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data Início</label>
                <DatePicker 
                  date={dateFilter.start} 
                  setDate={(date) => setDateFilter(prev => ({ ...prev, start: date }))}
                  className="bg-muted/20 border-white/10 h-14 rounded-2xl font-bold w-full"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data Fim</label>
                <DatePicker 
                  date={dateFilter.end} 
                  setDate={(date) => setDateFilter(prev => ({ ...prev, end: date }))}
                  className="bg-muted/20 border-white/10 h-14 rounded-2xl font-bold w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-lg font-black tracking-tight uppercase">Histórico ({filteredTransactions.length})</h3>
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-muted/20 text-muted-foreground border-none">
              {dateFilter.start && format(dateFilter.start, "dd/MM") || '--'} - {dateFilter.end && format(dateFilter.end, "dd/MM") || '--'}
            </Badge>
          </div>

          <div className="grid gap-4">
            {filteredTransactions.length === 0 ? (
              <Card className="border-2 border-dashed border-white/10 rounded-[2.5rem] bg-transparent flex flex-col items-center justify-center p-20">
                <div className="w-20 h-20 rounded-3xl bg-muted/20 flex items-center justify-center text-muted-foreground mb-6">
                  <Search size={40} />
                </div>
                <h3 className="text-lg font-black tracking-tight text-muted-foreground">Nada por aqui</h3>
                <p className="text-xs text-muted-foreground/60 mt-2">Nenhuma movimentação para estes filtros.</p>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="glass-card border-white/5 shadow-sm transition-all group hover:bg-white/50 dark:hover:bg-white/5 overflow-hidden">
                  <CardContent className="p-4 px-6 md:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6 group transition-transform hover:translate-x-1">
                      <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transform group-hover:rotate-3 transition-transform",
                        transaction.type === 'income' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      )}>
                        {transaction.type === 'income' ? 
                          <ArrowUpRight className="h-7 w-7" /> : 
                          <ArrowDownLeft className="h-7 w-7" />
                        }
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight text-foreground">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{transaction.category}</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-[10px] font-bold text-muted-foreground">{getRelativeDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className={cn(
                        "text-xl font-black tabular-nums tracking-tight",
                        transaction.type === 'income' ? "text-emerald-500" : "text-foreground"
                      )}>
                        {transaction.type === 'income' ? "+" : "-"} {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.isPaid ? "secondary" : "outline"} className={cn(
                        "rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border-none",
                        transaction.isPaid 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "bg-amber-500/10 text-amber-500"
                      )}>
                        {transaction.isPaid ? "Confirmado" : "Pendente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
