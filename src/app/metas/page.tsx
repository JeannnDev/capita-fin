"use client"

import React, { useState } from "react"
import { AppShell } from "@/components/AppShell"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatDate } from "@/lib/format"
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Metas</h1>
            <p className="text-sm text-muted-foreground">Organize suas caixinhas de economia</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nova Meta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da meta</Label>
                  <Input placeholder="Ex: Viagem para Europa" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor da meta</Label>
                    <Input type="number" step="0.01" placeholder="0,00" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required />
                  </div>
                  {!editingGoal && (
                    <div className="space-y-2">
                      <Label>Valor inicial</Label>
                      <Input type="number" step="0.01" placeholder="0,00" value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Prazo (opcional)</Label>
                  <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => {
                          const IconComponent = goalIcons[icon.value]
                          return (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2"><IconComponent className="h-4 w-4" />{icon.label}</div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.value }} />{color.label}</div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>Cancelar</Button>
                  <Button type="submit">{editingGoal ? "Salvar" : "Criar Meta"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total guardado</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(totalSaved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total das metas</p>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(totalTarget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progresso geral</p>
                  <p className="text-xl font-semibold text-foreground">{overallPct.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Card key={goal.id} className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer" onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${goal.color}15` }}>
                        <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">{goal.name}</CardTitle>
                        {goal.deadline && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {daysRemaining !== null && daysRemaining > 0 ? `${daysRemaining} dias restantes` : daysRemaining === 0 ? "Hoje" : "Prazo expirado"}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(goal) }}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id) }}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-sm text-muted-foreground">de {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(0)}% concluído</span>
                      <span>Faltam {formatCurrency(remaining)}</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedGoal(goal); setIsContributionOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" />Adicionar valor
                  </Button>
                  {isExpanded && goal.contributions.length > 0 && (
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Histórico</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {goal.contributions
                          .slice()
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((contribution) => {
                            const account = accounts.find((a) => a.id === contribution.accountId)
                            return (
                              <div key={contribution.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span className="text-muted-foreground">{formatDate(contribution.date)}</span>
                                  {account && <span className="text-xs text-muted-foreground">({account.name})</span>}
                                </div>
                                <span className="font-medium text-green-500">+{formatCurrency(contribution.amount)}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {goals.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma meta criada</h3>
                <p className="mt-1 text-sm text-muted-foreground">Comece criando sua primeira caixinha de economia</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />Criar Meta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contribution Dialog */}
        <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar valor — {selectedGoal?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContribution} className="space-y-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={contributionData.amount} onChange={(e) => setContributionData({ ...contributionData, amount: e.target.value })} required autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Conta de origem (opcional)</Label>
                <Select value={contributionData.accountId} onValueChange={(value) => setContributionData({ ...contributionData, accountId: value })}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
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
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saldo atual</span>
                    <span>{formatCurrency(selectedGoal.currentAmount)}</span>
                  </div>
                  {contributionData.amount && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Novo saldo</span>
                      <span className="font-medium text-green-500">{formatCurrency(selectedGoal.currentAmount + parseFloat(contributionData.amount || "0"))}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsContributionOpen(false); setSelectedGoal(null); setContributionData({ amount: "", accountId: "" }) }}>Cancelar</Button>
                <Button type="submit">Adicionar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
