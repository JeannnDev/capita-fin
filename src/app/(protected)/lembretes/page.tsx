"use client"

import React, { useState } from "react"
import { Plus, Calendar, Check, AlertCircle, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { Card } from "@/components/ui/card"
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
import { PremiumBalanceCard } from "@/components/ui/premium-balance-card"
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
      <div className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-[2rem] sm:rounded-3xl border p-4 sm:p-5 transition-all duration-500 gap-4 sm:gap-5",
        isOverdue 
          ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 shadow-lg shadow-red-500/5" 
          : "bg-card border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
      )}>
        <div className="flex items-center gap-4 sm:gap-5">
           <div className={cn(
             "flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110",
             reminder.isPaid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : isOverdue ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-primary/10 text-primary"
           )}>
             {reminder.isPaid ? (
               <Check className="h-6 w-6 sm:h-7 sm:w-7" />
             ) : isOverdue ? (
               <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
             ) : (
               <Calendar className="h-6 w-6 sm:h-7 sm:w-7" style={{ color }} />
             )}
           </div>
           
           <div className="space-y-0.5 min-w-0">
             <div className="flex items-center gap-2">
               <p className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase leading-tight truncate">{reminder.title}</p>
               {isOverdue && <span className="text-[8px] sm:text-[9px] font-black bg-red-500/90 text-white px-2 py-0.5 rounded-full uppercase shrink-0 shadow-sm">Atrasado</span>}
             </div>
             <div className="flex flex-wrap items-center gap-2 sm:gap-3">
               <span className={cn(
                 "text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                 isOverdue ? "text-red-500 bg-red-500/10" : "text-muted-foreground bg-muted/30"
               )}>
                 {reminder.isPaid ? "Liquidado" : getRelativeDate(reminder.dueDate)}
               </span>
               <div className="hidden xs:block h-1 w-1 rounded-full bg-border" />
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 truncate max-w-[80px] sm:max-w-none">{reminder.category}</span>
               <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] py-0.5 px-2">{getFrequencyLabel(reminder.frequency)}</Badge>
             </div>
           </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 sm:border-l sm:pl-6">
           <div className="flex flex-col items-start sm:items-end">
             <span className={cn(
               "text-xl sm:text-2xl font-black tracking-tighter tabular-nums leading-none",
               isOverdue ? "text-red-500" : "text-foreground"
             )}>{formatCurrency(reminder.amount)}</span>
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">Valor Previsto</span>
           </div>

           {showActions && !reminder.isPaid && (
             <div className="flex items-center gap-2 pl-0 sm:pl-0">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95" 
                 onClick={() => markReminderPaid(reminder.id)}
               >
                 <Check className="h-5 w-5" />
               </Button>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-all active:scale-95">
                     <MoreHorizontal className="h-5 w-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="rounded-2xl border-border bg-card shadow-2xl p-2 min-w-[160px]">
                   <DropdownMenuItem onClick={() => handleEdit(reminder)} className="rounded-xl p-3 font-bold cursor-pointer">
                     <Pencil className="mr-2 h-4 w-4" /> Editar
                   </DropdownMenuItem>
                   <DropdownMenuItem className="text-destructive rounded-xl p-3 font-bold cursor-pointer" onClick={() => deleteReminder(reminder.id)}>
                     <Trash2 className="mr-2 h-4 w-4" /> Excluir
                   </DropdownMenuItem>
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
      <div className="space-y-8 max-w-[1200px] mx-auto">
        {/* Summary Dashboard */}
        <PremiumBalanceCard
          title="Total em Lembretes"
          amount={formatCurrency(totalPending)}
          icon={Clock}
          action={
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 rounded-full px-8 font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all bg-white text-primary hover:bg-white/90 border-none">
                  <Plus className="h-5 w-5" />
                  Novo
                </Button>
              </DialogTrigger>              <DialogContent className="rounded-[2.5rem] border-border bg-card shadow-2xl p-10 max-w-lg">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-black tracking-tight">{editingReminder ? "Editar Lembrete" : "Novo Lembrete"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Título do Lembrete</label>
                    <Input className="rounded-2xl bg-muted/40 border-border h-14 px-5 text-base font-bold transition-all focus:bg-background focus:ring-primary/20" placeholder="Ex: Aluguel, Internet..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Valor</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xs">R$</span>
                        <Input className="rounded-2xl bg-muted/40 border-border h-14 pl-12 pr-5 text-lg font-black transition-all focus:bg-background focus:ring-primary/20" type="number" step="0.01" placeholder="0,00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Vencimento</label>
                      <div className="h-14 flex items-center bg-muted/40 rounded-2xl border border-border px-1 transition-all focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
                        <DatePicker 
                          date={formData.dueDate} 
                          setDate={(date) => setFormData({ ...formData, dueDate: date })} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Frequência</label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as Reminder["frequency"] })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-border h-14 px-5 font-bold transition-all focus:bg-background focus:ring-primary/20"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-border bg-card p-2">
                          {frequencyOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value} className="rounded-xl font-bold p-3">{opt.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Categoria</label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="rounded-2xl bg-muted/20 border-border h-14 px-5 font-bold transition-all focus:bg-background focus:ring-primary/20"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-border bg-card p-2">
                          {expenseCategories.map((cat) => (<SelectItem key={cat.id} value={cat.name} className="rounded-xl font-bold p-3">{cat.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-lg font-black tracking-tight shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] mt-4">
                    {editingReminder ? "Salvar alterações" : "Criar lembrete"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
          secondaryMetrics={[
            {
              label: "Pendentes",
              value: pendingReminders.length.toString(),
              icon: Calendar,
              trend: "up"
            },
            {
              label: "Atrasados",
              value: overdueReminders.length.toString(),
              icon: AlertCircle,
              trend: "down"
            }
          ]}
        />

        <Tabs defaultValue="pending" className="w-full flex-col space-y-12">
          <div className="flex flex-col items-center gap-8">
             <div className="flex flex-col items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-primary/20" />
             </div>
             <TabsList className="bg-card/50 backdrop-blur-sm rounded-full p-1.5 h-16 border border-border w-full max-w-2xl grid grid-cols-2 shadow-2xl relative">
                <TabsTrigger 
                  value="pending" 
                  className="relative z-10 rounded-full px-8 text-xs font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300"
                >
                  Pendentes
                </TabsTrigger>
                <TabsTrigger 
                  value="paid" 
                  className="relative z-10 rounded-full px-8 text-xs font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300"
                >
                  Liquidados
                </TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value="pending" className="outline-none focus:ring-0">
            <div className="bg-muted/10 rounded-[3rem]">
               <div className="flex items-center justify-between mb-8 px-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">Próximos Vencimentos</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/30">
                     <Clock className="h-3 w-3" />
                     Sincronizado
                  </div>
               </div>
               <div className="space-y-4">
                 {pendingReminders.length === 0 ? (
                   <Card className="border-dashed bg-card/50 shadow-none border-border p-16 text-center rounded-[2.5rem]">
                      <div className="flex flex-col items-center gap-6">
                         <div className="p-6 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                           <Check className="h-10 w-10 text-emerald-500" />
                         </div>
                         <div>
                            <p className="text-xl font-black tracking-tight text-foreground">Tudo sob controle!</p>
                            <p className="mt-1 text-sm font-bold text-muted-foreground/40 uppercase tracking-widest leading-loose text-center">Nenhum compromisso pendente identificado no momento.</p>
                         </div>
                      </div>
                   </Card>
                 ) : (
                   pendingReminders.map((reminder) => (<ReminderCard key={reminder.id} reminder={reminder} />))
                 )}
               </div>
            </div>
          </TabsContent>
          
          <TabsContent value="paid" className="outline-none focus:ring-0">
             <div className="bg-muted/10 rounded-[3rem] p-8 border border-border shadow-inner">
                <div className="flex items-center justify-between mb-8 px-4">
                   <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">Histórico de Quitação</h4>
                </div>
                <div className="space-y-4">
                  {paidReminders.length === 0 ? (
                    <Card className="border-dashed bg-card/50 shadow-none border-border p-16 text-center rounded-[2.5rem]">
                       <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 italic">O histórico de pagamentos aparecerá aqui após a liquidação.</p>
                    </Card>
                  ) : (
                    paidReminders.map((reminder) => (<ReminderCard key={reminder.id} reminder={reminder} showActions={false} />))
                  )}
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
