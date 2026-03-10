"use client"

import React, { useState } from "react"
import { Plus, ArrowUpRight, ArrowDownLeft, Filter, Search } from "lucide-react"
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
import type { Transaction } from "@/lib/types"

export default function TransacoesPage() {
  const { transactions, addTransaction, deleteTransaction, accounts, categories, getTotalIncome, getTotalExpenses } = useFinance()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as Transaction["type"],
    category: "",
    accountId: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTransaction({
      id: crypto.randomUUID(),
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      type: formData.type,
      category: formData.category,
      accountId: formData.accountId,
      date: formData.date,
      isPaid: true,
    })
    resetForm()
  }

  const resetForm = () => {
    setFormData({ description: "", amount: "", type: "expense", category: "", accountId: "", date: new Date().toISOString().split("T")[0] })
    setIsDialogOpen(false)
  }

  const filteredTransactions = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <ArrowDownLeft className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receitas do mês</p>
                <p className="text-xl font-bold text-green-500">{formatCurrency(getTotalIncome())}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <ArrowUpRight className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Despesas do mês</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(getTotalExpenses())}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filter === "all" ? "Todas" : filter === "income" ? "Receitas" : "Despesas"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>Todas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("income")}>Receitas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("expense")}>Despesas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Button type="button" variant={formData.type === "expense" ? "default" : "outline"} className="flex-1" onClick={() => setFormData({ ...formData, type: "expense", category: "" })}>Despesa</Button>
                    <Button type="button" variant={formData.type === "income" ? "default" : "outline"} className="flex-1" onClick={() => setFormData({ ...formData, type: "income", category: "" })}>Receita</Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Input placeholder="Ex: Supermercado, Salário..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor</label>
                    <Input type="number" step="0.01" placeholder="0,00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{filteredCategories.map((cat) => (<SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conta</label>
                    <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{accounts.map((account) => (<SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full">Adicionar transação</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{formatFullDate(date)}</h3>
              <Card>
                <CardContent className="divide-y p-0">
                  {dayTransactions.map((transaction) => {
                    const color = getCategoryColor(transaction.category)
                    const isIncome = transaction.type === "income"
                    const account = accounts.find((a) => a.id === transaction.accountId)

                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
                            {isIncome ? (
                              <ArrowDownLeft className="h-5 w-5" style={{ color }} />
                            ) : (
                              <ArrowUpRight className="h-5 w-5" style={{ color }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category} · {account?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-base font-semibold", isIncome ? "text-green-500" : "text-foreground")}>
                            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteTransaction(transaction.id)}>
                            ×
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
