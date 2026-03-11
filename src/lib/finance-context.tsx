"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Account, Transaction, Reminder, Budget, Category, Goal, GoalContribution } from "./types"

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
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addContribution: (goalId: string, contribution: GoalContribution) => void
  getTotalBalance: (accountId?: string) => number
  getTotalIncome: (month?: number, year?: number, accountId?: string) => number
  getTotalExpenses: (month?: number, year?: number, accountId?: string) => number
  getStartingBalance: (month: number, year: number, accountId?: string) => number
  getMonthBalance: (month: number, year: number, accountId?: string) => number
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const defaultAccounts: Account[] = [
  { id: "1", name: "Carteira", balance: 450.0, type: "wallet", color: "#8b5cf6", institution: "Dinheiro" },
  { id: "2", name: "Nubank", balance: 3240.0, type: "checking", color: "#8b5cf6", institution: "Nubank" },
  { id: "3", name: "Vale Alimentação", balance: 1500.0, type: "food", color: "#f59e0b", institution: "Alelo" },
  { id: "4", name: "Santander", balance: 2850.0, type: "checking", color: "#ef4444", institution: "Santander" },
]

const defaultCategories: Category[] = [
  { id: "1", name: "Alimentação", icon: "utensils", color: "#f59e0b", type: "expense" },
  { id: "2", name: "Transporte", icon: "car", color: "#3b82f6", type: "expense" },
  { id: "3", name: "Moradia", icon: "home", color: "#10b981", type: "expense" },
  { id: "4", name: "Saúde", icon: "heart", color: "#ef4444", type: "expense" },
  { id: "5", name: "Lazer", icon: "gamepad", color: "#8b5cf6", type: "expense" },
  { id: "6", name: "Educação", icon: "book", color: "#06b6d4", type: "expense" },
  { id: "7", name: "Salário", icon: "briefcase", color: "#22c55e", type: "income" },
  { id: "8", name: "Freelance", icon: "laptop", color: "#6366f1", type: "income" },
]

const defaultTransactions: Transaction[] = [
  { id: "1", description: "Supermercado", amount: 320.5, type: "expense", category: "Alimentação", accountId: "2", date: "2026-03-08", isPaid: true },
  { id: "2", description: "Uber", amount: 45.0, type: "expense", category: "Transporte", accountId: "4", date: "2026-03-07", isPaid: true },
  { id: "3", description: "Salário", amount: 5500.0, type: "income", category: "Salário", accountId: "2", date: "2026-03-05", isPaid: true },
  { id: "4", description: "Restaurante", amount: 89.0, type: "expense", category: "Alimentação", accountId: "3", date: "2026-03-06", isPaid: true },
  { id: "5", description: "Cinema", amount: 65.0, type: "expense", category: "Lazer", accountId: "1", date: "2026-03-04", isPaid: true },
  { id: "6", description: "Farmácia", amount: 120.0, type: "expense", category: "Saúde", accountId: "4", date: "2026-03-03", isPaid: true },
  { id: "7", description: "Curso online", amount: 199.0, type: "expense", category: "Educação", accountId: "2", date: "2026-03-02", isPaid: true },
  { id: "8", description: "Projeto freelance", amount: 1200.0, type: "income", category: "Freelance", accountId: "4", date: "2026-03-01", isPaid: true },
]

const defaultReminders: Reminder[] = [
  { id: "1", title: "Aluguel", amount: 1800.0, dueDate: "2026-03-15", frequency: "monthly", category: "Moradia", isPaid: false },
  { id: "2", title: "Internet", amount: 120.0, dueDate: "2026-03-20", frequency: "monthly", category: "Moradia", isPaid: false },
  { id: "3", title: "Academia", amount: 89.0, dueDate: "2026-03-10", frequency: "monthly", category: "Saúde", isPaid: true },
  { id: "4", title: "Seguro do carro", amount: 2400.0, dueDate: "2026-06-01", frequency: "yearly", category: "Transporte", isPaid: false },
  { id: "5", title: "Faxina", amount: 200.0, dueDate: "2026-03-14", frequency: "weekly", category: "Moradia", isPaid: false },
]

const defaultBudgets: Budget[] = [
  { id: "1", category: "Alimentação", limit: 1500, spent: 409.5, color: "#f59e0b", limitType: "value", limitValue: 1500 },
  { id: "2", category: "Transporte", limit: 500, spent: 45, color: "#3b82f6", limitType: "value", limitValue: 500 },
  { id: "3", category: "Lazer", limit: 400, spent: 65, color: "#8b5cf6", limitType: "value", limitValue: 400 },
  { id: "4", category: "Saúde", limit: 300, spent: 120, color: "#ef4444", limitType: "value", limitValue: 300 },
  { id: "5", category: "Educação", limit: 500, spent: 199, color: "#06b6d4", limitType: "value", limitValue: 500 },
]

const defaultGoals: Goal[] = [
  {
    id: "1",
    name: "Viagem para Europa",
    targetAmount: 15000,
    currentAmount: 4500,
    deadline: "2026-12-01",
    icon: "plane",
    color: "#8b5cf6",
    contributions: [
      { id: "1", amount: 2000, date: "2026-01-15", accountId: "2" },
      { id: "2", amount: 1500, date: "2026-02-15", accountId: "2" },
      { id: "3", amount: 1000, date: "2026-03-05", accountId: "4" },
    ],
  },
  {
    id: "2",
    name: "Reserva de emergência",
    targetAmount: 20000,
    currentAmount: 12000,
    icon: "shield",
    color: "#10b981",
    contributions: [
      { id: "1", amount: 5000, date: "2025-10-01", accountId: "2" },
      { id: "2", amount: 4000, date: "2025-12-01", accountId: "2" },
      { id: "3", amount: 3000, date: "2026-02-01", accountId: "4" },
    ],
  },
  {
    id: "3",
    name: "Novo notebook",
    targetAmount: 5000,
    currentAmount: 2200,
    deadline: "2026-06-01",
    icon: "laptop",
    color: "#6366f1",
    contributions: [
      { id: "1", amount: 1200, date: "2026-02-10", accountId: "4" },
      { id: "2", amount: 1000, date: "2026-03-01", accountId: "2" },
    ],
  },
]

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts)
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions)
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders)
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets)
  const [categories] = useState<Category[]>(defaultCategories)
  const [goals, setGoals] = useState<Goal[]>(defaultGoals)
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const addAccount = (account: Account) => {
    setAccounts((prev) => [...prev, account])
  }

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...account } : a)))
  }

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])

    const account = accounts.find((a) => a.id === transaction.accountId)
    if (account) {
      const newBalance =
        transaction.type === "income"
          ? account.balance + transaction.amount
          : account.balance - transaction.amount
      updateAccount(account.id, { balance: newBalance })
    }

    if (transaction.type === "expense") {
      const budget = budgets.find((b) => b.category === transaction.category)
      if (budget) {
        updateBudget(budget.id, { spent: budget.spent + transaction.amount })
      }
    }
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const old = transactions.find((t) => t.id === id)
    if (!old) return

    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

    // Undo old transaction effects
    const oldAccount = accounts.find((a) => a.id === old.accountId)
    if (oldAccount) {
      const reversedBalance = old.type === "income" 
        ? oldAccount.balance - old.amount 
        : oldAccount.balance + old.amount
      updateAccount(oldAccount.id, { balance: reversedBalance })
    }

    if (old.type === "expense") {
      const oldBudget = budgets.find((b) => b.category === old.category)
      if (oldBudget) {
        updateBudget(oldBudget.id, { spent: oldBudget.spent - old.amount })
      }
    }

    // Apply new transaction effects
    const newTransaction = { ...old, ...updates }
    const newAccount = accounts.find((a) => a.id === newTransaction.accountId)
    if (newAccount) {
      const newBalance = newTransaction.type === "income"
        ? newAccount.balance + newTransaction.amount
        : newAccount.balance - newTransaction.amount
      updateAccount(newAccount.id, { balance: newBalance })
    }

    if (newTransaction.type === "expense") {
      const newBudget = budgets.find((b) => b.category === newTransaction.category)
      if (newBudget) {
        updateBudget(newBudget.id, { spent: newBudget.spent + newTransaction.amount })
      }
    }
  }

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) return

    // Revert balance
    const account = accounts.find((a) => a.id === transaction.accountId)
    if (account) {
      const newBalance = transaction.type === "income"
        ? account.balance - transaction.amount
        : account.balance + transaction.amount
      updateAccount(account.id, { balance: newBalance })
    }

    // Revert budget spent
    if (transaction.type === "expense") {
      const budget = budgets.find((b) => b.category === transaction.category)
      if (budget) {
        updateBudget(budget.id, { spent: budget.spent - transaction.amount })
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder])
  }

  const updateReminder = (id: string, reminder: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...reminder } : r)))
  }

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  const markReminderPaid = (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (!reminder || reminder.isPaid) return

    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isPaid: true } : r)))

    // Automatically create a transaction if an account is linked
    if (reminder.accountId) {
      addTransaction({
        id: crypto.randomUUID(),
        description: `Pagamento: ${reminder.title}`,
        amount: reminder.amount,
        type: "expense",
        category: reminder.category,
        accountId: reminder.accountId,
        date: new Date().toISOString().split("T")[0],
        isPaid: true,
      })
    }
  }

  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...budget } : b)))
  }

  const addBudget = (budget: Budget) => {
    setBudgets((prev) => [...prev, budget])
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const addGoal = (goal: Goal) => {
    setGoals((prev) => [...prev, goal])
  }

  const updateGoal = (id: string, goal: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goal } : g)))
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const addContribution = (goalId: string, contribution: GoalContribution) => {
    if (contribution.accountId) {
      const account = accounts.find((a) => a.id === contribution.accountId)
      if (account) {
        updateAccount(account.id, { balance: account.balance - contribution.amount })
      }
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            currentAmount: g.currentAmount + contribution.amount,
            contributions: [...g.contributions, contribution],
          }
        }
        return g
      })
    )
  }

  const getStartingBalance = (month: number, year: number, accountId?: string) => {
    const targetDate = new Date(year, month, 1)
    
    return transactions
      .filter((t) => {
        const transDate = new Date(t.date)
        const matchesAccount = !accountId || t.accountId === accountId
        return transDate < targetDate && matchesAccount
      })
      .reduce((sum, t) => {
        return t.type === "income" ? sum + t.amount : sum - t.amount
      }, 0)
  }

  const getTotalBalance = (accountId?: string) => {
    if (accountId) {
      return accounts.find(a => a.id === accountId)?.balance || 0
    }
    return accounts.reduce((sum, account) => sum + account.balance, 0)
  }

  const getTotalIncome = (month?: number, year?: number, accountId?: string) => {
    const targetMonth = month ?? new Date().getMonth()
    const targetYear = year ?? new Date().getFullYear()
    return transactions
      .filter((t) => {
        const d = new Date(t.date)
        const matchesAccount = !accountId || t.accountId === accountId
        return t.type === "income" && d.getMonth() === targetMonth && d.getFullYear() === targetYear && matchesAccount
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpenses = (month?: number, year?: number, accountId?: string) => {
    const targetMonth = month ?? new Date().getMonth()
    const targetYear = year ?? new Date().getFullYear()
    return transactions
      .filter((t) => {
        const d = new Date(t.date)
        const matchesAccount = !accountId || t.accountId === accountId
        return t.type === "expense" && d.getMonth() === targetMonth && d.getFullYear() === targetYear && matchesAccount
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getMonthBalance = (month: number, year: number, accountId?: string) => {
    const starting = getStartingBalance(month, year, accountId)
    const income = getTotalIncome(month, year, accountId)
    const expense = getTotalExpenses(month, year, accountId)
    return starting + income - expense
  }

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        reminders,
        budgets,
        categories,
        goals,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderPaid,
        updateBudget,
        addBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addContribution,
        getTotalBalance,
        getTotalIncome,
        getTotalExpenses,
        getStartingBalance,
        getMonthBalance,
        isSidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
