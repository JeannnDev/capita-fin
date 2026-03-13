"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import {
  financialAccounts,
  transactions,
  reminders,
  budgets,
  categories,
  goals,
  goalContributions,
} from "@/db/schema"
import { eq, desc } from "drizzle-orm"

// ─────────────────────────────────────────────────────────────
// Helper: obtém sessão autenticada ou lança erro
// ─────────────────────────────────────────────────────────────
async function getAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Não autorizado")
  return session
}

// ─────────────────────────────────────────────────────────────
// GET: busca todos os dados financeiros do usuário
// ─────────────────────────────────────────────────────────────
export async function getFinanceData() {
  const session = await getAuthSession()
  const userId = session.user.id

  // Seed de categorias padrão se o usuário não tiver nenhuma
  const existingCategories = await db.select().from(categories).where(eq(categories.userId, userId))
  let userCategories = existingCategories

  if (existingCategories.length === 0) {
    const defaultCats = [
      { nome: "Alimentação",       icon: "utensils",     color: "#f59e0b", type: "expense", userId },
      { nome: "Transporte",        icon: "car",          color: "#3b82f6", type: "expense", userId },
      { nome: "Moradia",           icon: "home",         color: "#10b981", type: "expense", userId },
      { nome: "Saúde",             icon: "heart",        color: "#ef4444", type: "expense", userId },
      { nome: "Lazer",             icon: "gamepad",      color: "#8b5cf6", type: "expense", userId },
      { nome: "Educação",          icon: "book",         color: "#06b6d4", type: "expense", userId },
      { nome: "Cartão de Crédito", icon: "credit-card",  color: "#4f46e5", type: "expense", userId },
      { nome: "Salário",           icon: "briefcase",    color: "#22c55e", type: "income",  userId },
      { nome: "Freelance",         icon: "laptop",       color: "#6366f1", type: "income",  userId },
    ]
    await db.insert(categories).values(defaultCats)
    userCategories = await db.select().from(categories).where(eq(categories.userId, userId))
  }

  const [
    userAccounts,
    rawTransactions,
    userReminders,
    userBudgets,
    userGoals,
    allContributions,
  ] = await Promise.all([
    db.select().from(financialAccounts).where(eq(financialAccounts.userId, userId)),
    db.select({
      id:           transactions.id,
      description:  transactions.descricao,
      amount:       transactions.valor,
      type:         transactions.type,
      date:         transactions.date,
      isPaid:       transactions.isPaid,
      accountId:    transactions.accountId,
      categoryId:   transactions.categoryId,
      categoryName: categories.nome,
    })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date)),
    db.select().from(reminders).where(eq(reminders.userId, userId)),
    db.select().from(budgets).where(eq(budgets.userId, userId)),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(goalContributions),
  ])

  return {
    accounts: userAccounts.map(a => ({
      id: a.id, name: a.name, balance: a.balance,
      type: a.type, color: a.color, institution: a.institution,
    })),
    transactions: rawTransactions.map(t => ({
      id: t.id,
      description: t.description || "",
      amount: t.amount,
      type: t.type,
      category: t.categoryName || "Geral",
      accountId: t.accountId || "",
      date: t.date.toISOString().split("T")[0],
      isPaid: t.isPaid,
    })),
    reminders: userReminders.map(r => ({
      id: r.id, title: r.title, amount: r.amount,
      dueDate: r.dueDate.toISOString().split("T")[0],
      frequency: r.frequency, category: r.category,
      isPaid: r.isPaid, accountId: r.accountId,
    })),
    budgets: userCategories
      .filter(c => c.type === "expense")
      .map(cat => {
        const existingBudget = userBudgets.find(b => b.category === cat.nome)
        const spent = rawTransactions
          .filter(t => t.type === "expense" && t.categoryName === cat.nome)
          .reduce((sum, t) => sum + t.amount, 0)
        return {
          id: existingBudget?.id || cat.id,
          category: cat.nome,
          limit: existingBudget?.limit || 0,
          spent,
          color: cat.color,
          limitType: existingBudget?.limitType || "value",
          limitValue: existingBudget?.limitValue || 0,
        }
      }),
    categories: userCategories.map(c => ({
      id: c.id, name: c.nome, icon: c.icon, color: c.color, type: c.type,
    })),
    goals: userGoals.map(g => ({
      id: g.id, name: g.name, targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline ? g.deadline.toISOString().split("T")[0] : null,
      icon: g.icon, color: g.color,
      contributions: allContributions
        .filter(c => c.goalId === g.id)
        .map(c => ({
          id: c.id, amount: c.amount,
          date: c.date.toISOString().split("T")[0],
          accountId: c.accountId,
        })),
    })),
  }
}
