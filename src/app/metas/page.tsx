"use client"

import React, { useState } from "react"
import { AppShell } from "@/components/AppShell"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatDate } from "@/lib/format"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
import { cn } from "@/lib/utils"
import type { Goal, GoalContribution } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Target,
  Plane,
  Home,
  Car,
  Laptop,
  Gift,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Sparkles,
  Calendar,
  TrendingUp,
  Wallet,
} from "lucide-react"

const goalIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  target: Target,
  plane: Plane,
  home: Home,
  car: Car,
  laptop: Laptop,
  gift: Gift,
  briefcase: Briefcase,
  graduation: GraduationCap,
  heart: Heart,
  shield: Shield,
  sparkles: Sparkles,
}

const iconOptions = [
  { value: "target", label: "Objetivo" },
  { value: "plane", label: "Viagem" },
  { value: "home", label: "Casa" },
  { value: "car", label: "Carro" },
  { value: "laptop", label: "Tecnologia" },
  { value: "gift", label: "Presente" },
  { value: "briefcase", label: "Trabalho" },
  { value: "graduation", label: "Educação" },
  { value: "heart", label: "Saúde" },
  { value: "shield", label: "Segurança" },
  { value: "sparkles", label: "Outro" },
]

const colorOptions = [
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#6366f1", label: "Indigo" },
]

export default function MetasPage() {
  const { goals, accounts, addGoal, updateGoal, deleteGoal, addContribution } = useFinance()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isContributionOpen, setIsContributionOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)

  const [formData, setFormData] = useState({ name: "", targetAmount: "", currentAmount: "", deadline: "", icon: "target", color: "#8b5cf6" })
  const [contributionData, setContributionData] = useState({ amount: "", accountId: "" })

  const resetForm = () => {
    setFormData({ name: "", targetAmount: "", currentAmount: "", deadline: "", icon: "target", color: "#8b5cf6" })
    setEditingGoal(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const goalData: Goal = {
      id: editingGoal?.id || crypto.randomUUID(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal?.currentAmount || parseFloat(formData.currentAmount || "0"),
      deadline: formData.deadline || undefined,
      icon: formData.icon,
      color: formData.color,
      contributions: editingGoal?.contributions || [],
    }
    if (editingGoal) updateGoal(editingGoal.id, goalData)
    else addGoal(goalData)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleContribution = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return
    const contribution: GoalContribution = {
      id: crypto.randomUUID(),
      amount: parseFloat(contributionData.amount),
      date: new Date().toISOString().split("T")[0],
      accountId: contributionData.accountId || undefined,
    }
    addContribution(selectedGoal.id, contribution)
    setIsContributionOpen(false)
    setSelectedGoal(null)
    setContributionData({ amount: "", accountId: "" })
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({ name: goal.name, targetAmount: goal.targetAmount.toString(), currentAmount: goal.currentAmount.toString(), deadline: goal.deadline || "", icon: goal.icon, color: goal.color })
    setIsDialogOpen(true)
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <AppShell title="Metas">
      <div className="space-y-8 max-w-[1200px] mx-auto">
        {/* Summary Dashboard */}
        <PremiumBalanceCard
          title="Total Guardado"
          amount={formatCurrency(totalSaved)}
          icon={Target}
          action={
             <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 rounded-full px-8 font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all bg-white text-primary hover:bg-white/90 border-none">
                  <Plus className="h-5 w-5" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black tracking-tight">{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome da Meta</label>
                    <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20" placeholder="Ex: Viagem para Europa" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Alvo</label>
                      <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold" type="number" step="0.01" placeholder="0,00" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prazo</label>
                      <Input className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ícone</label>
                      <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl">
                          {iconOptions.map((icon) => {
                            const IconComponent = goalIcons[icon.value]
                            return (
                              <SelectItem key={icon.value} value={icon.value} className="rounded-xl font-bold">
                                <div className="flex items-center gap-2"><IconComponent className="h-4 w-4" />{icon.label}</div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cor</label>
                      <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl">
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value} className="rounded-xl font-bold">
                              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.value }} />{color.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl text-base font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                    {editingGoal ? "Salvar alterações" : "Criar Meta"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
          secondaryMetrics={[
            {
              label: "Objetivo Total",
              value: formatCurrency(totalTarget),
              icon: TrendingUp,
              trend: "up"
            },
            {
              label: "Concluído",
              value: `${overallPct.toFixed(0)}%`,
              icon: Wallet,
              trend: "up"
            }
          ]}
        />

        {/* Goals Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const IconComponent = goalIcons[goal.icon] || Target
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
            const isExpanded = expandedGoal === goal.id

            let daysRemaining: number | null = null
            if (goal.deadline) {
              const today = new Date()
              const target = new Date(goal.deadline)
              daysRemaining = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            }

            return (
              <Card 
                key={goal.id} 
                className={cn(
                  "glass-card overflow-hidden transition-all duration-500 group border-white/5",
                  isExpanded ? "ring-2 ring-primary/20 shadow-2xl scale-[1.02]" : "hover:scale-[1.01] hover:bg-white/50 dark:hover:bg-white/5"
                )}
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transform group-hover:rotate-6 transition-transform" style={{ backgroundColor: `${goal.color}25`, border: `1px solid ${goal.color}50` }}>
                        <IconComponent className="h-7 w-7" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight text-foreground">{goal.name}</h3>
                        {goal.deadline && (
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {daysRemaining !== null && daysRemaining > 0 ? `${daysRemaining} DIAS` : daysRemaining === 0 ? "HOJE" : "EXPIRADO"}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity font-black text-foreground">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl p-2 min-w-[160px]">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(goal) }} className="rounded-xl p-3 font-bold cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl p-3 font-bold cursor-pointer text-destructive" onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id) }}>
                          <Trash2 className="mr-2 h-4 w-4" />Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex items-end justify-between">
                        <span className="text-2xl font-black tabular-nums tracking-tighter text-foreground">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">DE {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="relative h-3 overflow-hidden rounded-full bg-muted/30 p-0.5">
                        <div className="h-full rounded-full transition-all duration-1000 shadow-sm shadow-black/20" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em]">
                        <span className="font-bold" style={{ color: goal.color }}>{progress.toFixed(0)}% CONCLUÍDO</span>
                        <span className="text-muted-foreground">FALTA {formatCurrency(remaining)}</span>
                      </div>
                    </div>

                    <Button 
                      className="cursor-pointer w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                      onClick={(e) => { e.stopPropagation(); setSelectedGoal(goal); setIsContributionOpen(true) }}
                    >
                      <Plus className="mr-2 h-4 w-4" />Adicionar valor
                    </Button>
                  </div>

                  {isExpanded && goal.contributions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Histórico de Aportes</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {goal.contributions
                          .slice()
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((contribution) => {
                            const account = accounts.find((a) => a.id === contribution.accountId)
                            return (
                              <div key={contribution.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-white/5">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black tracking-tight text-foreground/80">{formatDate(contribution.date)}</span>
                                  {account && <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{account.name}</span>}
                                </div>
                                <span className="text-sm font-black text-green-500 tabular-nums">+{formatCurrency(contribution.amount)}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
          {goals.length === 0 && (
            <Card className="col-span-full border-dashed bg-transparent shadow-none border-white/10 p-16 text-center">
               <div className="flex flex-col items-center gap-6">
                  <div className="p-6 rounded-full bg-muted/10">
                    <Target className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-foreground">Nenhuma meta criada</h3>
                    <p className="mt-1 text-sm font-bold text-muted-foreground/50">Comece criando sua primeira caixinha de economia</p>
                  </div>
                  <Button className="h-12 px-8 rounded-full font-black bg-primary shadow-xl shadow-primary/20" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-5 w-5" />Criar Meta
                  </Button>
               </div>
            </Card>
          )}
        </div>

        {/* Contribution Dialog */}
        <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
          <DialogContent className="rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Adicionar valor — {selectedGoal?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContribution} className="space-y-6 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quanto você guardou?</label>
                <Input className="rounded-2xl bg-muted/20 border-white/10 h-14 px-6 focus:ring-primary/20 text-xl font-black tabular-nums" type="number" step="0.01" placeholder="0,00" value={contributionData.amount} onChange={(e) => setContributionData({ ...contributionData, amount: e.target.value })} required autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">De qual conta saiu o dinheiro?</label>
                <Select value={contributionData.accountId} onValueChange={(value) => setContributionData({ ...contributionData, accountId: value })}>
                  <SelectTrigger className="rounded-2xl bg-muted/20 border-white/10 h-12 px-4 focus:ring-primary/20 font-bold"><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl">
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="rounded-xl font-bold">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color }} />
                          {account.name} — {formatCurrency(account.balance)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedGoal && (
                <div className="rounded-[1.5rem] bg-primary/5 p-5 border border-primary/10">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">
                      <span>Projeção de Progresso</span>
                      <Target className="h-3.5 w-3.5 text-primary/50" />
                   </div>
                   <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-muted-foreground">Saldo atual</span>
                      <span className="font-black tabular-nums">{formatCurrency(selectedGoal.currentAmount)}</span>
                    </div>
                    <div className="h-px bg-primary/10" />
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-muted-foreground">Novo saldo</span>
                      <span className="text-lg font-black text-green-500 tabular-nums">{formatCurrency(selectedGoal.currentAmount + parseFloat(contributionData.amount || "0"))}</span>
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full h-14 rounded-2xl text-base font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                Confirmar Depósito
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
