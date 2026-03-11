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
      <div className="space-y-6">
        {/* Back and Breadcrumb */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/contas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{account.name}</h2>
            <p className="text-sm text-muted-foreground">{account.institution} · {accountTypeLabels[account.type]}</p>
          </div>
        </div>

        {/* Account Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Icon className="h-16 w-16" />
            </div>
            <CardContent className="p-6">
              <p className="text-sm text-primary-foreground/80 font-medium">Saldo Atual</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(account.balance)}</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">Entradas no período</p>
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-500 mt-1">{formatCurrency(stats.income)}</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">Saídas no período</p>
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(stats.expense)}</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">Saldo projetado</p>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  stats.endingBalance >= 0 ? "bg-blue-500/20" : "bg-orange-500/20"
                )}>
                  {stats.endingBalance >= 0 ? <ArrowUpRight className="h-4 w-4 text-blue-500" /> : <ArrowDownLeft className="h-4 w-4 text-orange-500" />}
                </div>
              </div>
              <p className={cn(
                "text-2xl font-bold mt-1",
                stats.endingBalance >= 0 ? "text-blue-500" : "text-orange-500"
              )}>{formatCurrency(stats.endingBalance)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Saldo inicial: {formatCurrency(stats.startingBalance)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Buscar por descrição ou categoria</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Ex: Supermercado, Salário..." 
                className="pl-10 bg-muted/30 border-none h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:w-[400px]">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Início</label>
              <DatePicker 
                date={dateFilter.start} 
                setDate={(date) => setDateFilter(prev => ({ ...prev, start: date }))}
                className="bg-muted/30 border-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fim</label>
              <DatePicker 
                date={dateFilter.end} 
                setDate={(date) => setDateFilter(prev => ({ ...prev, end: date }))}
                className="bg-muted/30 border-none"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Movimentações ({filteredTransactions.length})</h3>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {dateFilter.start && format(dateFilter.start, "dd/MM/yyyy")} - {dateFilter.end && format(dateFilter.end, "dd/MM/yyyy")}
            </Badge>
          </div>

          <div className="grid gap-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed border-border/50">
                <p className="text-muted-foreground">Nenhuma movimentação encontrada para os filtros aplicados.</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:bg-muted/50 transition-colors border-border/50 group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        transaction.type === 'income' ? "bg-green-500/10" : "bg-red-500/10"
                      )}>
                        {transaction.type === 'income' ? 
                          <ArrowUpRight className="h-5 w-5 text-green-500" /> : 
                          <ArrowDownLeft className="h-5 w-5 text-red-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">{transaction.category}</span>
                          <span>•</span>
                          <span>{getRelativeDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-bold",
                        transaction.type === 'income' ? "text-green-500" : "text-foreground"
                      )}>
                        {transaction.type === 'income' ? "+" : "-"} {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.isPaid ? "secondary" : "outline"} className="text-[10px] h-4 mt-1">
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
