"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Account, Transaction, Reminder, Budget, Category, Goal, GoalContribution } from "./types"
import { authClient } from "./auth-client"
import { useRouter } from "next/navigation"

// ─── Server Actions ──────────────────────────────────────────
import { getFinanceData } from "@/actions/finance/get-finance-data"
import { createAccount, updateAccount as updateAccountAction, deleteAccount as deleteAccountAction } from "@/actions/accounts/accounts"
import { createTransaction, updateTransaction as updateTransactionAction, deleteTransaction as deleteTransactionAction } from "@/actions/transactions/transactions"
import { createCategory } from "@/actions/categories/categories"

// ─── Context Types ────────────────────────────────────────────
interface FinanceContextType {
  accounts: Account[]
  transactions: Transaction[]
  reminders: Reminder[]
  budgets: Budget[]
  categories: Category[]
  goals: Goal[]
  addAccount: (account: Account) => void
  updateAccount: (id: string, account: Partial<Account>) => void
  deleteAccount: (id: string) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addReminder: (reminder: Reminder) => void
  updateReminder: (id: string, reminder: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  markReminderPaid: (id: string) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  addBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  addCategory: (category: { nome: string; icon: string; color: string; type: string }) => Promise<Category | undefined>
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addContribution: (goalId: string, contribution: GoalContribution) => void
  getTotalBalance: (accountId?: string) => number
  getTotalIncome: (month?: number, year?: number, accountId?: string) => number
  getTotalExpenses: (month?: number, year?: number, accountId?: string) => number
  getStartingBalance: (month: number, year: number, accountId?: string) => number
  getMonthBalance: (month: number, year: number, accountId?: string) => number
  refetchAll: () => Promise<void>
  isLoading: boolean
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  // ─── Helper: atualiza todo o estado com os dados do server ─────
  const applyFinanceData = (data: Awaited<ReturnType<typeof getFinanceData>>) => {
    setAccounts(data.accounts as Account[])
    setTransactions(data.transactions as Transaction[])
    setReminders(data.reminders as Reminder[])
    setBudgets(data.budgets as Budget[])
    setCategories(data.categories as Category[])
    setGoals(data.goals as unknown as Goal[])
  }

  const refetchAll = async () => {
    try {
      const data = await getFinanceData()
      applyFinanceData(data)
    } catch (error) {
      console.error("Failed to refetch finance data:", error)
    }
  }

  // ─── Carga Inicial ─────────────────────────────────────────────
  useEffect(() => {
    if (!session) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getFinanceData()
      .then(applyFinanceData)
      .catch(err => console.error("Failed to fetch finance data:", err))
      .finally(() => setIsLoading(false))
  }, [session])

  // ─── Accounts ─────────────────────────────────────────────────
  const addAccount = async (account: Account) => {
    try {
      const newAccount = await createAccount({
        name: account.name,
        balance: account.balance,
        type: account.type,
        color: account.color,
        institution: account.institution,
      })
      setAccounts(prev => [...prev, newAccount as Account])
      router.refresh()
    } catch (error) {
      console.error("Failed to add account:", error)
    }
  }

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const updated = await updateAccountAction(id, updates)
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      await deleteAccountAction(id)
      setAccounts(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error("Failed to delete account:", error)
    }
  }

  // ─── Transactions ──────────────────────────────────────────────
  const addTransaction = async (transaction: Transaction) => {
    try {
      const saved = await createTransaction({
        accountId:   transaction.accountId,
        categoryId:  undefined,
        category:    transaction.category,
        amount:      transaction.amount,
        description: transaction.description,
        type:        transaction.type,
        date:        transaction.date,
        isPaid:      transaction.isPaid,
      })
      setTransactions(prev => [saved as Transaction, ...prev])
      // Re-sincroniza tudo (saldos, orçamentos, etc.)
      await refetchAll()
    } catch (error) {
      console.error("Failed to add transaction:", error)
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const old = transactions.find(t => t.id === id)
    if (!old) return
    // Optimistic update
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    try {
      await updateTransactionAction(id, {
        description: updates.description,
        amount:      updates.amount,
        type:        updates.type,
        categoryId:  undefined,
        accountId:   updates.accountId,
        date:        updates.date,
        isPaid:      updates.isPaid,
      })
      await refetchAll()
      router.refresh()
    } catch (error) {
      console.error("Failed to update transaction:", error)
      // Rollback
      await refetchAll()
    }
  }

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    if (!transaction) return
    // Optimistic update
    setTransactions(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTransactionAction(id)
      await refetchAll()
      router.refresh()
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      await refetchAll()
    }
  }

  // ─── Reminders (client-side only por enquanto) ─────────────────
  const addReminder = (reminder: Reminder) => {
    setReminders(prev => [...prev, reminder])
  }

  const updateReminder = (id: string, reminder: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...reminder } : r))
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const markReminderPaid = (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder || reminder.isPaid) return
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isPaid: true } : r))
    if (reminder.accountId) {
      addTransaction({
        id:          crypto.randomUUID(),
        description: `Pagamento: ${reminder.title}`,
        amount:      reminder.amount,
        type:        "expense",
        category:    reminder.category,
        accountId:   reminder.accountId,
        date:        new Date().toISOString().split("T")[0],
        isPaid:      true,
      })
    }
  }

  // ─── Budgets (client-side only por enquanto) ───────────────────
  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...budget } : b))
  }
  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget])
  }
  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  // ─── Categories ────────────────────────────────────────────────
  const addCategory = async (cat: { nome: string; icon: string; color: string; type: string }) => {
    try {
      const newCat = await createCategory(cat)
      setCategories(prev => {
        const exists = prev.find(c => c.id === newCat.id)
        if (exists) return prev
        return [...prev, newCat as Category]
      })
      return newCat as Category
    } catch (error) {
      console.error("Failed to add category:", error)
    }
  }

  // ─── Goals (client-side only por enquanto) ─────────────────────
  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal])
  }
  const updateGoal = (id: string, goal: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g))
  }
  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }
  const addContribution = (goalId: string, contribution: GoalContribution) => {
    if (contribution.accountId) {
      const account = accounts.find(a => a.id === contribution.accountId)
      if (account) updateAccount(account.id, { balance: account.balance - contribution.amount })
    }
    setGoals(prev =>
      prev.map(g => g.id === goalId
        ? { ...g, currentAmount: g.currentAmount + contribution.amount, contributions: [...g.contributions, contribution] }
        : g
      )
    )
  }

  // ─── Computed Helpers ──────────────────────────────────────────
  const getStartingBalance = (month: number, year: number, accountId?: string) => {
    const targetDate = new Date(year, month, 1)
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return d < targetDate && (!accountId || t.accountId === accountId)
      })
      .reduce((sum, t) => t.type === "income" ? sum + t.amount : sum - t.amount, 0)
  }

  const getTotalBalance = (accountId?: string) => {
    if (accountId) return accounts.find(a => a.id === accountId)?.balance || 0
    return accounts.reduce((sum, a) => sum + a.balance, 0)
  }

  const getTotalIncome = (month?: number, year?: number, accountId?: string) => {
    const m = month ?? new Date().getMonth()
    const y = year ?? new Date().getFullYear()
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return t.type === "income" && d.getMonth() === m && d.getFullYear() === y && (!accountId || t.accountId === accountId)
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpenses = (month?: number, year?: number, accountId?: string) => {
    const m = month ?? new Date().getMonth()
    const y = year ?? new Date().getFullYear()
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return t.type === "expense" && d.getMonth() === m && d.getFullYear() === y && (!accountId || t.accountId === accountId)
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getMonthBalance = (month: number, year: number, accountId?: string) => {
    return getStartingBalance(month, year, accountId)
      + getTotalIncome(month, year, accountId)
      - getTotalExpenses(month, year, accountId)
  }

  return (
    <FinanceContext.Provider value={{
      accounts, transactions, reminders, budgets, categories, goals,
      addAccount, updateAccount, deleteAccount,
      addTransaction, updateTransaction, deleteTransaction,
      addReminder, updateReminder, deleteReminder, markReminderPaid,
      updateBudget, addBudget, deleteBudget,
      addCategory,
      addGoal, updateGoal, deleteGoal, addContribution,
      getTotalBalance, getTotalIncome, getTotalExpenses,
      getStartingBalance, getMonthBalance,
      refetchAll,
      isLoading, isSidebarOpen, setSidebarOpen,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error("useFinance must be used within a FinanceProvider")
  return context
}
