"use client"

import React, { useState } from "react"
import { AlertTriangle, Pencil, TrendingUp, Plus, Trash2, DollarSign, Percent, MoreHorizontal } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { NumericFormat } from "react-number-format"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Budget } from "@/lib/types"

export default function OrcamentoPage() {
  const { budgets, updateBudget, addBudget, deleteBudget, addTransaction, accounts, getTotalIncome, categories } = useFinance()
  
  // Dialog states
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [spendDialogOpen, setSpendDialogOpen] = useState(false)
  const [exceedConfirmation, setExceedConfirmation] = useState<{ budget: Budget; amount: number; description: string; accountId: string } | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    category: "",
    limitValue: 0,
    limitType: "value" as 'value' | 'percentage',
    color: "#8b5cf6"
  })
  
  const [spendData, setSpendData] = useState({ 
    budgetId: "", 
    amount: 0, 
    description: "", 
    accountId: "" 
  })

  const totalIncome = getTotalIncome() || 5000

  const getEffectiveLimit = (budget: Budget) => {
    if (budget.limitType === 'percentage') {
      return (totalIncome * (budget.limitValue || 0)) / 100
    }
    return budget.limitValue || budget.limit
  }

  const totalBudget = budgets.reduce((sum, b) => sum + getEffectiveLimit(b), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const handleSaveBudget = () => {
    const val = formData.limitValue
    const calculatedLimit = formData.limitType === 'value' ? val : (totalIncome * val) / 100

    if (editingBudget) {
      updateBudget(editingBudget.id, { 
        category: formData.category,
        limitType: formData.limitType,
        limitValue: val,
        limit: calculatedLimit,
        color: formData.color
      })
      setEditingBudget(null)
    } else {
      addBudget({
        id: crypto.randomUUID(),
        category: formData.category,
        limitType: formData.limitType,
        limitValue: val,
        limit: calculatedLimit,
        spent: 0,
        color: formData.color
      })
      setIsAddDialogOpen(false)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      category: "",
      limitValue: 0,
      limitType: "value",
      color: "#8b5cf6"
    })
  }

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      limitValue: budget.limitValue || budget.limit,
      limitType: budget.limitType || 'value',
      color: budget.color
    })
  }

  const handleSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const budget = budgets.find((b) => b.id === spendData.budgetId)
    if (!budget) return

    const amount = spendData.amount
    const limit = getEffectiveLimit(budget)
    const newSpent = budget.spent + amount

    if (newSpent > limit) {
      setExceedConfirmation({ budget, amount, description: spendData.description, accountId: spendData.accountId })
      return
    }
    confirmSpend(budget, amount, spendData.description, spendData.accountId)
  }

  const confirmSpend = (budget: Budget, amount: number, description: string, accountId: string) => {
    updateBudget(budget.id, { spent: budget.spent + amount })
    addTransaction({
      id: Date.now().toString(),
      description: description || budget.category,
      amount,
      type: "expense",
      category: budget.category,
      accountId: accountId || accounts[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      isPaid: true,
    })
    setSpendDialogOpen(false)
    setSpendData({ budgetId: "", amount: 0, description: "", accountId: "" })
    setExceedConfirmation(null)
  }

  const BudgetCard = ({ budget }: { budget: Budget }) => {
    const limit = getEffectiveLimit(budget)
    const progress = limit > 0 ? (budget.spent / limit) * 100 : 0
    const remaining = limit - budget.spent
    const isOver = progress >= 100
    const isWarning = progress >= 80 && progress < 100

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.color }} />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{budget.category}</span>
                {budget.limitType === 'percentage' && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {budget.limitValue}% da renda
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditClick(budget)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteBudget(budget.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={cn("text-2xl font-bold", isOver ? "text-destructive" : "text-foreground")}>
                {formatCurrency(budget.spent)}
              </span>
              <span className="text-sm text-muted-foreground">de {formatCurrency(limit)}</span>
            </div>
            <Progress
              value={Math.min(progress, 100)}
              className="h-2"
              indicatorClassName={cn(isOver ? "bg-destructive" : isWarning ? "bg-yellow-500" : "bg-primary")}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={cn(isOver ? "text-destructive" : "text-muted-foreground")}>
                {isOver ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Excedido em {formatCurrency(Math.abs(remaining))}
                  </span>
                ) : (
                  `Restam ${formatCurrency(remaining)}`
                )}
              </span>
              <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => { setSpendData({ ...spendData, budgetId: budget.id }); setSpendDialogOpen(true) }}>
            Registrar gasto
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <AppShell title="Orçamento">
      <div className="space-y-6">
        {/* Overview */}
        <Card className="border-none shadow-sm bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento mensal planejado</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-bold text-primary">{formatCurrency(totalBudget)}</p>
                   <span className="text-xs text-muted-foreground">de {formatCurrency(totalIncome)} (Renda)</span>
                </div>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Gasto total</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Restante livre</p>
                  <p className={cn("text-xl font-semibold", totalRemaining < 0 ? "text-destructive" : "text-green-500")}>
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Progress
                value={Math.min(overallProgress, 100)}
                className="h-2.5 bg-background"
                indicatorClassName={cn(overallProgress >= 100 ? "bg-destructive" : overallProgress >= 80 ? "bg-yellow-500" : "bg-primary")}
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{overallProgress.toFixed(0)}% do limite utilizado</span>
                <div className="flex items-center gap-1 text-primary animate-pulse">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase">Monitorando</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Categorias de Orçamento</h2>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="rounded-full px-4">
              <Plus className="mr-2 h-4 w-4" /> Nova Categoria
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (<BudgetCard key={budget.id} budget={budget} />))}
            {budgets.length === 0 && (
              <Card className="col-span-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <DollarSign className="h-10 w-10 mb-2 opacity-20" />
                  <p>Nenhum orçamento configurado</p>
                  <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>Começar agora</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add/Edit Budget Dialog */}
        <Dialog open={isAddDialogOpen || !!editingBudget} onOpenChange={(open) => { 
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingBudget(null)
            resetForm()
          }
        }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
              <DialogDescription>
                Configure um limite para acompanhar seus gastos em uma categoria específica.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Categoria</label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.type === 'expense').map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Limite</label>
                  <div className="flex border rounded-lg overflow-hidden bg-muted p-0.5">
                    <Button
                      type="button"
                      variant={formData.limitType === 'value' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn("h-7 px-3 rounded-md", formData.limitType === 'value' && "shadow-sm bg-background")}
                      onClick={() => setFormData({ ...formData, limitType: 'value' })}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant={formData.limitType === 'percentage' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn("h-7 px-3 rounded-md", formData.limitType === 'percentage' && "shadow-sm bg-background")}
                      onClick={() => setFormData({ ...formData, limitType: 'percentage' })}
                    >
                      <Percent className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      value={formData.limitValue || ""}
                      onValueChange={(values) => {
                        setFormData({ ...formData, limitValue: values.floatValue || 0 })
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="0,00"
                      className={cn(
                        "h-12 text-xl font-bold transition-all",
                        formData.limitType === 'value' ? "pl-12" : "pl-4 pr-10"
                      )}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                      {formData.limitType === 'value' ? "R$" : ""}
                    </div>
                    {formData.limitType === 'percentage' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                        %
                      </div>
                    )}
                  </div>
                  {formData.limitType === 'percentage' && (
                    <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                      <p className="text-[11px] text-primary font-medium">
                        Equivale a <span className="font-bold">{formatCurrency((totalIncome * (formData.limitValue || 0)) / 100)}</span> fixos por mês.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Cor de identificação</label>
                <div className="flex gap-2.5">
                  {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#6366f1"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                        formData.color === c ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setFormData({ ...formData, color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingBudget(null); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSaveBudget} disabled={!formData.category || !formData.limitValue}>
                {editingBudget ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add expense dialog */}
        <Dialog open={spendDialogOpen} onOpenChange={setSpendDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Registrar gasto</DialogTitle>
              <DialogDescription>Adicione um gasto para {budgets.find((b) => b.id === spendData.budgetId)?.category}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSpendSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Descrição</label>
                <Input placeholder="Ex: Supermercado..." value={spendData.description} onChange={(e) => setSpendData({ ...spendData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Conta</label>
                <Select
                  value={spendData.accountId}
                  onValueChange={(value) => setSpendData({ ...spendData, accountId: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Valor</label>
                <div className="relative">
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    value={spendData.amount || ""}
                    onValueChange={(values) => {
                      setSpendData({ ...spendData, amount: values.floatValue || 0 })
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0,00"
                    className="pl-12 h-12 text-xl font-bold"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                    R$
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={!spendData.accountId || !spendData.amount}>
                Confirmar Gasto
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Exceed limit confirmation */}
        <AlertDialog open={!!exceedConfirmation} onOpenChange={(open) => !open && setExceedConfirmation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Limite excedido
              </AlertDialogTitle>
              <AlertDialogDescription>
                Este gasto de <strong>{formatCurrency(exceedConfirmation?.amount || 0)}</strong> irá exceder o limite de <strong>{exceedConfirmation?.budget.category}</strong>. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => exceedConfirmation && confirmSpend(exceedConfirmation.budget, exceedConfirmation.amount, exceedConfirmation.description, exceedConfirmation.accountId)}>
                Confirmar gasto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  )
}
