"use client"

import React, { useState } from "react"
import { Plus, ArrowUpRight, ArrowDownLeft, Filter, Search, Wallet, Pencil, Trash2 } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatFullDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
import type { Transaction } from "@/lib/types"
import Link from "next/link"

export default function TransacoesPage() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, accounts, categories, getTotalIncome, getTotalExpenses } = useFinance()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as Transaction["type"],
    category: "",
    categoryId: "",
    accountId: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const transactionData = {
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      type: formData.type,
      category: categories.find(c => c.id === formData.categoryId)?.name || "Geral",
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: formData.date,
      isPaid: true,
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData)
    } else {
      addTransaction({
        id: crypto.randomUUID(),
        ...transactionData
      })
    }
    resetForm()
  }

  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t)
    setFormData({
      description: t.description,
      amount: t.amount.toString(),
      type: t.type,
      category: t.category,
      categoryId: t.categoryId || "",
      accountId: t.accountId,
      date: t.date,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ description: "", amount: "", type: "expense", category: "", categoryId: "", accountId: "", date: new Date().toISOString().split("T")[0] })
    setEditingTransaction(null)
    setIsDialogOpen(false)
  }

  const filteredTransactions = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) =>
      (t.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (t.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredCategories = categories.filter((c) => c.type === formData.type)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#8b5cf6"
  }

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) groups[date] = []
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  return (
    <AppShell title="Transações">
      <div className="space-y-8 max-w-[1200px] mx-auto">
        {/* Transactions Summary Grid */}
        {/* Transactions Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <PremiumBalanceCard
            title="Total de Entradas"
            amount={formatCurrency(getTotalIncome())}
            icon={ArrowDownLeft}
            color="#059669"
          />
          <PremiumBalanceCard
            title="Total de Saídas"
            amount={formatCurrency(getTotalExpenses())}
            icon={ArrowUpRight}
            color="#e11d48"
          />
        </div>

        {/* Filters & Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar..."
              className="pl-12 h-12 sm:h-14 rounded-2xl bg-muted/20 border-white/5 focus:ring-primary/20 focus:bg-background/50 transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none h-12 sm:h-14 rounded-2xl border-white/10 bg-muted/10 px-4 sm:px-6 font-black gap-2 hover:bg-primary/5 transition-all text-[10px] sm:text-[11px] uppercase tracking-widest text-foreground">
                  <Filter className="h-4 w-4 shrink-0" />
                  <span className="truncate">{filter === "all" ? "Todas" : filter === "income" ? "Receitas" : "Despesas"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl p-2 min-w-[160px]">
                <DropdownMenuItem onClick={() => setFilter("all")} className="rounded-xl p-3 font-bold cursor-pointer">Todas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("income")} className="rounded-xl p-3 font-bold cursor-pointer text-green-500">Receitas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("expense")} className="rounded-xl p-3 font-bold cursor-pointer text-red-500">Despesas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="flex-1 sm:flex-none h-12 sm:h-14 gap-2 rounded-2xl px-4 sm:px-8 font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary text-white border-none active:scale-[0.98] text-[10px] sm:text-[11px] uppercase tracking-widest">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">Novo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-10">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">
                    {accounts.length === 0 ? "Ops!" : editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
                  </DialogTitle>
                </DialogHeader>

                {accounts.length === 0 ? (
                  <div className="py-6 sm:py-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center rotate-12">
                      <Wallet className="h-10 w-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-lg font-medium leading-relaxed opacity-70">
                        Você precisa cadastrar pelo menos uma **conta ou banco** antes de registrar uma transação.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full pt-4">
                      <Button asChild className="h-14 sm:h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-white">
                        <Link href="/contas">Cadastrar Minha Primeira Conta</Link>
                      </Button>
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl font-black text-muted-foreground uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors">
                        Agora não
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
                  <div className="flex p-1 bg-muted/20 rounded-2xl gap-1">
                    <Button type="button" variant={formData.type === "expense" ? "default" : "ghost"} className={cn("flex-1 rounded-xl font-bold transition-all", formData.type === "expense" && "shadow-lg bg-red-500 text-white")} onClick={() => setFormData({ ...formData, type: "expense", category: "" })}>Despesa</Button>
                    <Button type="button" variant={formData.type === "income" ? "default" : "ghost"} className={cn("flex-1 rounded-xl font-bold transition-all", formData.type === "income" && "shadow-lg bg-green-500 text-white")} onClick={() => setFormData({ ...formData, type: "income", category: "" })}>Receita</Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição</label>
                    <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20" placeholder="Ex: Supermercado, Salário..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor</label>
                      <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold" type="number" step="0.01" placeholder="0,00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data</label>
                       <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoria</label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl">
                          {filteredCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id} className="rounded-xl font-bold">{cat.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conta</label>
                      <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl">
                          {accounts.map((account) => (<SelectItem key={account.id} value={account.id} className="rounded-xl font-bold">{account.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 sm:h-16 rounded-2xl text-base font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] text-white">Confirmar Operação</Button>
                </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date} className="space-y-2 sm:space-y-3">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{formatFullDate(date)}</h3>
              <div className="grid gap-2">
                {dayTransactions.map((transaction) => {
                  const color = getCategoryColor(transaction.category)
                  const isIncome = transaction.type === "income"
                  const account = accounts.find((a) => a.id === transaction.accountId)

                  return (
                    <Card key={transaction.id} className="glass-card shadow-sm border-white/5 transition-all group hover:bg-white/50 dark:hover:bg-white/5 overflow-hidden">
                      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 sm:px-6 gap-4">
                        <div className="flex items-center gap-4 sm:gap-5 group transform transition-transform min-w-0">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transform group-hover:rotate-3 transition-transform" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                            {isIncome ? (
                              <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-black tracking-tight text-foreground truncate">{transaction.description}</p>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 truncate shrink-0" style={{ color: `${color}cc` }}>{transaction.category}</span>
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 truncate italic">{account?.name || 'Sem conta'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                          <span className={cn("text-base sm:text-lg font-black tabular-nums tracking-tight", isIncome ? "text-green-500" : "text-foreground")}>
                            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </span>
                          <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted/20 text-muted-foreground hover:text-primary hover:bg-primary/10 sm:opacity-0 group-hover:opacity-100 transition-all font-black shrink-0" onClick={() => handleEditClick(transaction)}>
                               <Pencil className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted/20 text-muted-foreground hover:text-destructive hover:bg-red-500/10 sm:opacity-0 group-hover:opacity-100 transition-all font-black shrink-0" onClick={() => deleteTransaction(transaction.id)}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <Card className="border-dashed bg-transparent shadow-none border-white/10 p-12 text-center">
               <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted/10">
                    <Search className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Nenhuma transação encontrada</p>
               </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
