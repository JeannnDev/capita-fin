"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Account, Transaction, Reminder, Budget, Category, Goal, GoalContribution } from "./types"
import { authClient } from "./auth-client"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("/api/finance")
        if (res.ok) {
          const data = await res.json()
          setAccounts(data.accounts || [])
          setTransactions(data.transactions || [])
          setReminders(data.reminders || [])
          setBudgets(data.budgets || [])
          setCategories(data.categories || [])
          setGoals(data.goals || [])
        }
      } catch (error) {
        console.error("Failed to fetch finance data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  const addAccount = async (account: Account) => {
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify(account),
      })
      if (res.ok) {
        const newAccount = await res.json()
        setAccounts((prev) => [...prev, newAccount])
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add account:", error)
    }
  }

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const res = await fetch("/api/accounts", {
        method: "PATCH",
        body: JSON.stringify({ id, ...updates }),
      })
      if (res.ok) {
        setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
      }
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  const addTransaction = async (transaction: Transaction) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify(transaction),
      })
      if (res.ok) {
        const saved = await res.json()
        setTransactions((prev) => [saved, ...prev])
        
        // Re-fetch to ensure everything is synced (balances, etc)
        const financeRes = await fetch("/api/finance")
        if (financeRes.ok) {
          const data = await financeRes.json()
          setAccounts(data.accounts)
          setTransactions(data.transactions)
        }
      }
    } catch (error) {
      console.error("Failed to add transaction:", error)
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const old = transactions.find((t) => t.id === id)
    if (!old) return

    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

    try {
      const res = await fetch("/api/transactions", {
        method: "PATCH",
        body: JSON.stringify({ id, ...updates }),
      })

      if (res.ok) {
        // Re-fetch to ensure everything is synced (balances, budgets, etc)
        const financeRes = await fetch("/api/finance")
        if (financeRes.ok) {
          const data = await financeRes.json()
          setAccounts(data.accounts)
          setTransactions(data.transactions)
          setBudgets(data.budgets)
        }
        router.refresh()
      } else {
        // Rollback state on error
        const financeRes = await fetch("/api/finance")
        if (financeRes.ok) {
          const data = await financeRes.json()
          setAccounts(data.accounts)
          setTransactions(data.transactions)
        }
      }
    } catch (error) {
      console.error("Failed to update transaction:", error)
    }
  }

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) return

    setTransactions((prev) => prev.filter((t) => t.id !== id))

    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        // Re-fetch to ensure everything is synced
        const financeRes = await fetch("/api/finance")
        if (financeRes.ok) {
          const data = await financeRes.json()
          setAccounts(data.accounts)
          setTransactions(data.transactions)
          setBudgets(data.budgets)
        }
        router.refresh()
      } else {
        // Rollback
        const financeRes = await fetch("/api/finance")
        if (financeRes.ok) {
          const data = await financeRes.json()
          setAccounts(data.accounts)
          setTransactions(data.transactions)
        }
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
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

  const addCategory = async (cat: { nome: string; icon: string; color: string; type: string }) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(cat),
      })
      if (res.ok) {
        const newCat = await res.json()
        setCategories((prev) => {
          const exists = prev.find(c => c.id === newCat.id)
          if (exists) return prev
          return [...prev, {
            id: newCat.id,
            name: newCat.nome,
            icon: newCat.icon,
            color: newCat.color,
            type: newCat.type
          }]
        })
        return {
          id: newCat.id,
          name: newCat.nome,
          icon: newCat.icon,
          color: newCat.color,
          type: newCat.type
        } as Category
      }
    } catch (error) {
      console.error("Failed to add category:", error)
    }
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
        addCategory,
        addGoal,
        updateGoal,
        deleteGoal,
        addContribution,
        getTotalBalance,
        getTotalIncome,
        getTotalExpenses,
        getStartingBalance,
        getMonthBalance,
        isLoading,
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
