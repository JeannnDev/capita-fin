"use client"

import React, { useState } from "react"
import { Plus, Wallet, Building2, CreditCard, UtensilsCrossed, MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/format"
import type { Account } from "@/lib/types"
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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

const colors = [
  "#8b5cf6", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#ec4899", "#06b6d4", "#84cc16",
]

const institutions = [
  "Nubank", "Santander", "Itaú", "Bradesco", "Banco do Brasil", "Caixa", "Inter", "C6 Bank", "Alelo", "VR", "Sodexo", "Dinheiro",
]

export default function ContasPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, getTotalBalance, getTotalIncome, getTotalExpenses } = useFinance()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "checking" as Account["type"],
    color: colors[0],
    institution: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: formData.name,
        balance: parseFloat(formData.balance) || 0,
        type: formData.type,
        color: formData.color,
        institution: formData.institution,
      })
    } else {
      addAccount({
        id: crypto.randomUUID(),
        name: formData.name,
        balance: parseFloat(formData.balance) || 0,
        type: formData.type,
        color: formData.color,
        institution: formData.institution,
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: "", balance: "", type: "checking", color: colors[0], institution: "" })
    setEditingAccount(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      balance: account.balance.toString(),
      type: account.type,
      color: account.color,
      institution: account.institution || "",
    })
    setIsDialogOpen(true)
  }

  return (
    <AppShell title="Minhas Contas">
      <div className="space-y-10 max-w-[1200px] mx-auto pb-10">
        {/* Header balance card with Action */}
        <PremiumBalanceCard
          title="Saldo Consolidado"
          amount={formatCurrency(getTotalBalance())}
          icon={Wallet}
          action={
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button className="h-12 px-8 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all bg-white text-primary hover:bg-white/90 border-none transition-all active:scale-[0.98]">
                  <Plus className="mr-2 h-5 w-5" /> Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl p-10">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tighter text-primary">{editingAccount ? "Editar Conta" : "Nova Conta"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identificação da Conta</label>
                    <Input
                      className="rounded-2xl bg-muted/20 border-white/5 h-14 px-6 text-lg font-bold focus:ring-primary/20"
                      placeholder="Ex: Nubank, Carteira..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo Atual</label>
                      <Input
                        className="rounded-2xl bg-muted/20 border-white/5 h-14 px-6 text-lg font-black tabular-nums focus:ring-primary/20"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Account["type"] })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-white/5 h-14 px-6 font-bold focus:ring-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl p-2">
                          {Object.entries(accountTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="rounded-xl font-bold">{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inștituição Financeira</label>
                    <Select value={formData.institution} onValueChange={(value) => setFormData({ ...formData, institution: value })}>
                      <SelectTrigger className="rounded-2xl bg-muted/20 border-white/5 h-14 px-6 font-bold focus:ring-primary/20">
                          <SelectValue placeholder="Selecione o banco..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl p-2 max-h-[300px]">
                        {institutions.map((inst) => (<SelectItem key={inst} value={inst} className="rounded-xl font-bold">{inst}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cor da Identidade</label>
                    <div className="flex flex-wrap gap-4 p-2 bg-muted/10 rounded-2xl border border-white/5">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "h-10 w-10 rounded-full transition-all border-4",
                            formData.color === color ? "border-white/50 scale-110 shadow-lg" : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black tracking-tight shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] text-white">
                    {editingAccount ? "Salvar Alterações" : "Ativar Conta"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
          secondaryMetrics={[
            {
               label: "Entradas",
               value: formatCurrency(getTotalIncome()),
               icon: TrendingUp,
               trend: "up"
            },
            {
               label: "Gasto Atual",
               value: formatCurrency(getTotalExpenses()),
               icon: TrendingDown,
               trend: "down"
            }
          ]}
        />

        {/* Accounts list */}
        <div id="accounts-list" className="space-y-4">
          <div className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Todas as Carteiras ({accounts.length})</div>
          <div className="grid gap-4">
            {accounts.map((account) => {
              const Icon = accountIcons[account.type] || Wallet
              return (
                <Card key={account.id} className="glass-card shadow-sm border-white/5 transition-all group hover:bg-white/50 dark:hover:bg-white/5 overflow-hidden">
                  <CardContent className="flex items-center justify-between p-4 px-6 md:p-6">
                    <Link 
                      href={`/contas/${account.id}`}
                      className="flex flex-1 items-center gap-6 group transform hover:translate-x-1 transition-transform"
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transform group-hover:rotate-3 transition-transform"
                        style={{ backgroundColor: `${account.color}15`, border: `1px solid ${account.color}30` }}
                      >
                        <Icon className="h-7 w-7" style={{ color: account.color }} />
                      </div>
                      <div>
                        <p className="text-xl font-black tracking-tight text-foreground">{account.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{account.institution || 'Outros'}</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                          <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] px-2 py-0.5 uppercase tracking-widest">
                            {accountTypeLabels[account.type]}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-8">
                      <span className="text-2xl font-black tabular-nums tracking-tighter text-foreground">
                        {formatCurrency(account.balance)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl p-2 min-w-[160px]">
                          <DropdownMenuItem onClick={() => handleEdit(account)} className="rounded-xl p-3 focus:bg-primary/5 cursor-pointer font-bold">
                            <Pencil className="mr-2 h-4 w-4 text-primary" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl p-3 focus:bg-red-500/10 text-destructive cursor-pointer font-bold" onClick={() => deleteAccount(account.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
