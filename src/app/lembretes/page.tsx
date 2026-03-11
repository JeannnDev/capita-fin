"use client"

import React, { useState } from "react"
import { Plus, Calendar, Check, AlertCircle, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, getRelativeDate, getFrequencyLabel } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Reminder } from "@/lib/types"

const frequencyOptions = [
  { value: "once", label: "Única vez" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
]

export default function LembretesPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, markReminderPaid, categories } = useFinance()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: undefined as Date | undefined,
    frequency: "monthly" as Reminder["frequency"],
    category: "",
    accountId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingReminder) {
      updateReminder(editingReminder.id, {
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : new Date().toISOString(),
        frequency: formData.frequency,
        category: formData.category,
        accountId: formData.accountId || undefined,
      })
    } else {
      addReminder({
        id: crypto.randomUUID(),
        title: formData.title,
        amount: parseFloat(formData.amount) || 0,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : new Date().toISOString(),
        frequency: formData.frequency,
        category: formData.category,
        accountId: formData.accountId || undefined,
        isPaid: false,
      })
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ title: "", amount: "", dueDate: undefined, frequency: "monthly", category: "", accountId: "" })
    setEditingReminder(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({ 
      title: reminder.title, 
      amount: reminder.amount.toString(), 
      dueDate: new Date(reminder.dueDate), 
      frequency: reminder.frequency, 
      category: reminder.category,
      accountId: reminder.accountId || ""
    })
    setIsDialogOpen(true)
  }

  const pendingReminders = reminders.filter((r) => !r.isPaid).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  const paidReminders = reminders.filter((r) => r.isPaid)
  const totalPending = pendingReminders.reduce((sum, r) => sum + r.amount, 0)
  const overdueReminders = pendingReminders.filter((r) => new Date(r.dueDate) < new Date())
  const expenseCategories = categories.filter((c) => c.type === "expense")

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#8b5cf6"
  }

  const ReminderCard = ({ reminder, showActions = true }: { reminder: Reminder; showActions?: boolean }) => {
    const isOverdue = new Date(reminder.dueDate) < new Date() && !reminder.isPaid
    const color = getCategoryColor(reminder.category)

    return (
      <div className={cn("flex items-center justify-between rounded-lg border p-4 transition-colors", isOverdue ? "border-destructive/50 bg-destructive/5" : "bg-card")}>
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: reminder.isPaid ? "#22c55e20" : isOverdue ? "#ef444420" : `${color}20` }}
          >
            {reminder.isPaid ? (
              <Check className="h-6 w-6 text-green-500" />
            ) : isOverdue ? (
              <AlertCircle className="h-6 w-6 text-destructive" />
            ) : (
              <Calendar className="h-6 w-6" style={{ color }} />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{reminder.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={cn(isOverdue ? "text-destructive" : "text-muted-foreground")}>
                {reminder.isPaid ? "Pago" : getRelativeDate(reminder.dueDate)}
              </span>
              <Badge variant="secondary" className="text-xs">{getFrequencyLabel(reminder.frequency)}</Badge>
              <span className="text-muted-foreground">{reminder.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-foreground">{formatCurrency(reminder.amount)}</span>
          {showActions && !reminder.isPaid && (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/20 hover:text-green-500" onClick={() => markReminderPaid(reminder.id)}>
                <Check className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(reminder)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteReminder(reminder.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppShell title="Lembretes">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total pendente</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-foreground">{pendingReminders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-xl font-bold text-red-500">{overdueReminders.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header + Add button */}
        <Tabs defaultValue="pending" className="w-full">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">Seus lembretes</h2>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="pending">Pendentes ({pendingReminders.length})</TabsTrigger>
                <TabsTrigger value="paid">Pagos ({paidReminders.length})</TabsTrigger>
              </TabsList>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novo lembrete</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingReminder ? "Editar lembrete" : "Novo lembrete"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input placeholder="Ex: Aluguel, Internet..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor</label>
                  <Input type="number" step="0.01" placeholder="0,00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de vencimento</label>
                  <DatePicker 
                    date={formData.dueDate} 
                    setDate={(date) => setFormData({ ...formData, dueDate: date })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frequência</label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as Reminder["frequency"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{frequencyOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{expenseCategories.map((cat) => (<SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conta de pagamento</label>
                  <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                    <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                    <SelectContent>
                      {useFinance().accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">{editingReminder ? "Salvar alterações" : "Criar lembrete"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingReminders.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhum lembrete pendente 🎉</p></CardContent></Card>
            ) : (
              pendingReminders.map((reminder) => (<ReminderCard key={reminder.id} reminder={reminder} />))
            )}
          </TabsContent>
          <TabsContent value="paid" className="mt-4 space-y-3">
            {paidReminders.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Nenhum pagamento realizado</p></CardContent></Card>
            ) : (
              paidReminders.map((reminder) => (<ReminderCard key={reminder.id} reminder={reminder} showActions={false} />))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
