"use client"

import React, { useState } from "react"
import { AlertTriangle, Pencil, TrendingUp, Plus, Trash2, DollarSign, Percent, MoreHorizontal, Wallet } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  const { budgets, updateBudget, addBudget, deleteBudget, addTransaction, accounts, getTotalIncome, categories, addCategory } = useFinance()
  
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

  const handleSaveBudget = async () => {
    const val = formData.limitValue
    const calculatedLimit = formData.limitType === 'value' ? val : (totalIncome * val) / 100

    let finalCategory = formData.category
    const existingCategory = categories.find(c => c.name.toLowerCase() === finalCategory.toLowerCase())

    if (!existingCategory) {
      const created = await addCategory({
        nome: finalCategory,
        icon: "tag",
        color: formData.color,
        type: "expense"
      })
      if (created) {
        finalCategory = created.name
      }
    } else {
      finalCategory = existingCategory.name
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, { 
        category: finalCategory,
        limitType: formData.limitType,
        limitValue: val,
        limit: calculatedLimit,
        color: formData.color
      })
      setEditingBudget(null)
    } else {
      addBudget({
        id: crypto.randomUUID(),
        category: finalCategory,
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


  return (
    <AppShell title="Orçamento">
      <div className="space-y-8 max-w-[1200px] mx-auto">
        {/* Summary Dashboard */}
        <PremiumBalanceCard
          title="Orçamento Planejado"
          amount={formatCurrency(totalBudget)}
          icon={DollarSign}
          secondaryMetrics={[
            {
              label: "Gasto Atual",
              value: formatCurrency(totalSpent),
              icon: TrendingUp,
              trend: "up"
            },
            {
              label: "Livre",
              value: formatCurrency(totalRemaining),
              icon: Wallet,
              trend: totalRemaining < 0 ? "down" : "up"
            }
          ]}
        />

        {/* Global Progress Section */}
        <Card className="glass-card border-white/5 p-6 overflow-hidden relative group">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Uso do Teto Orçamentário</p>
                 <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black tracking-tighter text-foreground">{overallProgress.toFixed(1)}%</h2>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      overallProgress >= 100 ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
                    )}>
                      {overallProgress >= 100 ? "EXCEDIDO" : "DENTRO DO LIMITE"}
                    </div>
                 </div>
              </div>
              <div className="flex-1 max-w-md w-full">
                 <div className="relative h-4 overflow-hidden rounded-full bg-muted/20 p-1">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-lg",
                        overallProgress >= 100 ? "bg-red-500" : overallProgress >= 80 ? "bg-yellow-500" : "bg-primary"
                      )} 
                      style={{ width: `${Math.min(overallProgress, 100)}%` }} 
                    />
                 </div>
              </div>
           </div>
           {/* Background decorative element */}
           <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        </Card>

        {/* Budget Categories Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black tracking-tight text-foreground uppercase tracking-[0.1em]">Limites por Categoria</h2>
            <Button 
              size="lg" 
              onClick={() => setIsAddDialogOpen(true)} 
              className="rounded-full px-6 font-black premium-gradient text-white hover:opacity-90 shadow-xl shadow-violet-900/30 border-none transition-all active:scale-[0.95]"
            >
              <Plus className="mr-2 h-5 w-5" /> Nova Categoria
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
               const limit = getEffectiveLimit(budget)
               const progress = limit > 0 ? (budget.spent / limit) * 100 : 0
               const remaining = limit - budget.spent
               const isOver = progress >= 100
               const isWarning = progress >= 80 && progress < 100

               return (
                <Card 
                  key={budget.id} 
                  className="glass-card group overflow-hidden border-white/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div className="p-0 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 ring-1 ring-white/10" style={{ backgroundColor: `${budget.color}15` }}>
                          <Wallet className="h-5 w-5" style={{ color: budget.color }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black tracking-tight text-foreground">{budget.category}</span>
                          {budget.limitType === 'percentage' ? (
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                              {budget.limitValue}% DA RENDA
                            </span>
                          ) : (
                             <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                               META MENSAL
                             </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/10 opacity-40 group-hover:opacity-100 transition-all">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl p-2 min-w-[160px]">
                          <DropdownMenuItem onClick={() => handleEditClick(budget)} className="rounded-xl p-3 font-bold cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl p-3 font-bold cursor-pointer text-destructive" onClick={() => deleteBudget(budget.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Gasto Atual</span>
                            <span className={cn(
                              "text-3xl font-black tabular-nums tracking-tighter leading-none mt-1",
                              isOver ? "text-red-500" : "text-foreground"
                            )}>
                              {formatCurrency(budget.spent)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Limite</span>
                            <span className="text-lg font-black tabular-nums tracking-tighter leading-none mt-1 text-foreground/60">
                              {formatCurrency(limit)}
                            </span>
                          </div>
                        </div>

                        <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/10 p-0.5 mt-4">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                              isOver ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-primary"
                            )} 
                            style={{ width: `${Math.min(progress, 100)}%` }} 
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1",
                            isOver 
                              ? "bg-red-500/10 text-red-500 ring-red-500/20" 
                              : isWarning 
                                ? "bg-yellow-500/10 text-yellow-500 ring-yellow-500/20" 
                                : "bg-green-500/10 text-green-500 ring-green-500/20"
                          )}>
                            {isOver ? "Meta Estourada" : isWarning ? "Atenção ao Limite" : "Sob Controle"}
                          </div>
                          <div className="flex items-center gap-1.5">
                             <span className="text-xs font-black tabular-nums text-foreground/80">{progress.toFixed(0)}%</span>
                             <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Gasto</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1">
                        <Button 
                          onClick={() => { setSpendData({ ...spendData, budgetId: budget.id }); setSpendDialogOpen(true) }}
                          className="w-full h-10 rounded-xl font-black bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.97] shadow-lg shadow-black/5 border-none group/btn text-xs" 
                        >
                          <Plus className="mr-2 h-3.5 w-3.5 transition-transform group-hover/btn:rotate-90" />
                          Registrar Gasto
                        </Button>
                        {!isOver && (
                          <p className="text-center mt-2 text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground/30 italic">
                            Disponível: {formatCurrency(remaining)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
               )
            })}
            {budgets.length === 0 && (
              <Card className="col-span-full border-dashed bg-transparent shadow-none border-white/10 p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                   <div className="p-6 rounded-full bg-muted/10">
                    <DollarSign className="h-10 w-10 text-muted-foreground/20" />
                   </div>
                   <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground">Orçamento Vazio</h3>
                    <p className="mt-1 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">Defina metas de gastos por categoria</p>
                   </div>
                   <Button size="lg" onClick={() => setIsAddDialogOpen(true)} className="rounded-full px-8 font-black premium-gradient text-white border-none shadow-xl shadow-primary/20">Começar agora</Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Add/Edit Budget Dialog */}
        <Dialog open={isAddDialogOpen || !!editingBudget} onOpenChange={(open) => { if (!open) { setIsAddDialogOpen(false); setEditingBudget(null); resetForm() }}}>
          <DialogContent className="rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">{editingBudget ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                Configure um teto financeiro para esta categoria
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Categoria (Orçamento)</label>
                </div>
                
                <div className="space-y-3">
                  <Input 
                    placeholder="Ex: Viagens, Streamings, Pets..." 
                    className="rounded-2xl bg-muted/20 border-white/10 h-14 px-6 text-lg font-black focus:ring-primary/20 transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />

                  {formData.category.length > 0 && categories.filter(c => c.type === 'expense' && c.name.toLowerCase().includes(formData.category.toLowerCase()) && c.name !== formData.category).length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {categories
                        .filter(c => c.type === 'expense' && c.name.toLowerCase().includes(formData.category.toLowerCase()) && c.name !== formData.category)
                        .slice(0, 3)
                        .map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.name, color: cat.color })}
                            className="px-3 py-1.5 rounded-xl bg-muted/20 hover:bg-primary/10 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                          >
                            Sugestão: {cat.name}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor do Limite</label>
                  <div className="flex bg-muted/20 rounded-xl p-1 border border-white/5 backdrop-blur-sm">
                    <button
                      type="button"
                      className={cn(
                        "h-8 px-4 rounded-lg text-[10px] font-black transition-all",
                        formData.limitType === 'value' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                      )}
                      onClick={() => setFormData({ ...formData, limitType: 'value' })}
                    >VALOR</button>
                    <button
                      type="button"
                      className={cn(
                        "h-8 px-4 rounded-lg text-[10px] font-black transition-all",
                        formData.limitType === 'percentage' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                      )}
                      onClick={() => setFormData({ ...formData, limitType: 'percentage' })}
                    >% DA RENDA</button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      value={formData.limitValue || ""}
                      onValueChange={(values) => setFormData({ ...formData, limitValue: values.floatValue || 0 })}
                      onFocus={(e) => e.target.select()}
                      placeholder="0,00"
                      className={cn(
                        "h-14 rounded-2xl bg-muted/20 border-white/10 px-12 text-2xl font-black tabular-nums focus:ring-primary/30 transition-all",
                        formData.limitType === 'percentage' ? "pr-16" : ""
                      )}
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-black">
                      {formData.limitType === 'value' ? "R$" : ""}
                    </div>
                    {formData.limitType === 'percentage' && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-black">%</div>
                    )}
                  </div>
                  {formData.limitType === 'percentage' && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10"><Percent className="h-4 w-4 text-primary" /></div>
                      <p className="text-[10px] text-primary/80 font-black uppercase tracking-widest">
                        Equivale a <span className="text-primary">{formatCurrency((totalIncome * (formData.limitValue || 0)) / 100)}</span> fixos por mês.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identificação Visual</label>
                <div className="flex flex-wrap gap-3 p-2 bg-muted/10 rounded-2xl border border-white/5">
                  {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#6366f1"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-full border-4 transition-all hover:scale-125",
                        formData.color === c ? "border-white/50 scale-110 shadow-lg" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setFormData({ ...formData, color: c })}
                    />
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSaveBudget} 
                disabled={!formData.category || !formData.limitValue}
                className="w-full h-14 rounded-2xl text-base font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                {editingBudget ? "Atualizar Orçamento" : "Ativar Orçamento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add expense dialog */}
        <Dialog open={spendDialogOpen} onOpenChange={setSpendDialogOpen}>
          <DialogContent className="rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Registrar Gasto Local</DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Lançamento em {budgets.find((b) => b.id === spendData.budgetId)?.category}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSpendSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">O que foi comprado?</label>
                <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20" placeholder="Ex: Supermercado..." value={spendData.description} onChange={(e) => setSpendData({ ...spendData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Origem do Saldo</label>
                    <Select value={spendData.accountId} onValueChange={(value) => setSpendData({ ...spendData, accountId: value })}>
                      <SelectTrigger className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold">
                        <SelectValue placeholder="Conta..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl p-2">
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id} className="rounded-xl font-bold">
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Gasto</label>
                    <div className="relative">
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        value={spendData.amount || ""}
                        onValueChange={(values) => setSpendData({ ...spendData, amount: values.floatValue || 0 })}
                        onFocus={(e) => e.target.select()}
                        placeholder="0,00"
                        className="rounded-2xl bg-muted/20 border-white/10 h-12 px-10 text-lg font-black tabular-nums"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-black text-xs">R$</div>
                    </div>
                 </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-base font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" disabled={!spendData.accountId || !spendData.amount}>
                Confirmar Lançamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Exceed limit confirmation */}
        <AlertDialog open={!!exceedConfirmation} onOpenChange={(open) => !open && setExceedConfirmation(null)}>
          <AlertDialogContent className="rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
                <div className="p-3 rounded-2xl bg-red-500/20"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
                Alerta de Teto Excedido
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-bold text-muted-foreground/60 py-2">
                Este gasto de <span className="text-foreground tracking-tighter">{formatCurrency(exceedConfirmation?.amount || 0)}</span> irá romper o limite definido para <span className="text-foreground">{exceedConfirmation?.budget.category}</span>.
                <br /><br />
                A manutenção do orçamento é fundamental para sua economia. Prosseguir mesmo assim?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-2xl border-white/10 h-12 font-black">CANCELAR</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => exceedConfirmation && confirmSpend(exceedConfirmation.budget, exceedConfirmation.amount, exceedConfirmation.description, exceedConfirmation.accountId)}
                className="rounded-2xl h-12 bg-red-500 hover:bg-red-600 text-white font-black"
              >
                PROSSEGUIR COM GASTO
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  )
}
