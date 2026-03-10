"use client"

import React, { useState } from "react"
import { Plus, Wallet, Building2, CreditCard, UtensilsCrossed, MoreHorizontal, Pencil, Trash2, ChevronRight } from "lucide-react"
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
  const { accounts, addAccount, updateAccount, deleteAccount, getTotalBalance } = useFinance()
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
    <AppShell title="Contas">
      <div className="space-y-6">
        {/* Header balance card */}
        <Card className="border-0 bg-primary text-primary-foreground">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-primary-foreground/80">Saldo total</p>
              <p className="text-3xl font-bold">{formatCurrency(getTotalBalance())}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? "Editar conta" : "Nova conta"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da conta</label>
                    <Input
                      placeholder="Ex: Nubank, Carteira..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Saldo atual</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Account["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(accountTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instituição</label>
                    <Select value={formData.institution} onValueChange={(value) => setFormData({ ...formData, institution: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {institutions.map((inst) => (<SelectItem key={inst} value={inst}>{inst}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-8 rounded-full transition-transform ${formData.color === color ? "scale-110 ring-2 ring-offset-2 ring-primary" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingAccount ? "Salvar alterações" : "Criar conta"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Accounts list */}
        <div id="accounts-list" className="space-y-3">
          {accounts.map((account) => {
            const Icon = accountIcons[account.type] || Wallet
            return (
              <Card key={account.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <Link 
                    href={`/contas/${account.id}`}
                    className="flex flex-1 items-center gap-4 hover:opacity-80 transition-opacity"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: account.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.institution} · {accountTypeLabels[account.type]}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(account.balance)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteAccount(account.id)}>
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
    </AppShell>
  )
}
