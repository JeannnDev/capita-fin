"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { transactions, financialAccounts } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

async function getAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Não autorizado")
  return session
}

export async function createTransaction(data: {
  accountId: string
  categoryId?: string
  category?: string
  amount: number
  description: string
  type: "income" | "expense"
  date: string
  isPaid?: boolean
}) {
  const session = await getAuthSession()

  const [newTransaction] = await db.insert(transactions).values({
    userId: session.user.id,
    accountId: data.accountId,
    categoryId: data.categoryId,
    valor: data.amount,
    descricao: data.description,
    type: data.type,
    date: new Date(data.date),
    mes: new Date(data.date).getMonth(),
    ano: new Date(data.date).getFullYear(),
    isPaid: data.isPaid ?? true,
  }).returning()

  // Atualiza o saldo da conta
  if (data.accountId) {
    const balanceChange = data.type === "income" ? data.amount : -data.amount
    await db.update(financialAccounts)
      .set({
        balance: sql`${financialAccounts.balance} + ${balanceChange}`,
        updatedAt: new Date(),
      })
      .where(eq(financialAccounts.id, data.accountId))
  }

  return {
    id: newTransaction.id,
    description: newTransaction.descricao || "",
    amount: newTransaction.valor,
    type: newTransaction.type,
    category: data.category || "Geral",
    accountId: newTransaction.accountId || "",
    date: newTransaction.date.toISOString().split("T")[0],
    isPaid: newTransaction.isPaid,
  }
}

export async function updateTransaction(id: string, updates: {
  description?: string
  amount?: number
  type?: "income" | "expense"
  categoryId?: string
  accountId?: string
  date?: string
  isPaid?: boolean
}) {
  await getAuthSession()

  if (!id) throw new Error("ID da transação é obrigatório")

  // Busca a transação atual para reverter o saldo
  const [oldTransaction] = await db.select().from(transactions).where(eq(transactions.id, id))
  if (!oldTransaction) throw new Error("Transação não encontrada")

  // Reverte saldo antigo
  if (oldTransaction.accountId) {
    const revertChange = oldTransaction.type === "income" ? -oldTransaction.valor : oldTransaction.valor
    await db.update(financialAccounts)
      .set({ balance: sql`${financialAccounts.balance} + ${revertChange}` })
      .where(eq(financialAccounts.id, oldTransaction.accountId))
  }

  // Monta os dados para atualização
  const updateData: {
    descricao?: string
    valor?: number
    type?: "income" | "expense"
    categoryId?: string
    accountId?: string
    date?: Date
    mes?: number
    ano?: number
    isPaid?: boolean
  } = {}
  if (updates.description !== undefined) updateData.descricao = updates.description
  if (updates.amount     !== undefined) updateData.valor = updates.amount
  if (updates.type       !== undefined) updateData.type = updates.type
  if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId
  if (updates.accountId  !== undefined) updateData.accountId = updates.accountId
  if (updates.date       !== undefined) {
    const d = new Date(updates.date)
    updateData.date = d
    updateData.mes  = d.getMonth()
    updateData.ano  = d.getFullYear()
  }
  if (updates.isPaid !== undefined) updateData.isPaid = updates.isPaid

  const [updatedTransaction] = await db.update(transactions)
    .set(updateData)
    .where(eq(transactions.id, id))
    .returning()

  // Aplica o novo saldo
  const currentAccountId = updates.accountId || oldTransaction.accountId
  const currentAmount    = updates.amount !== undefined ? updates.amount : oldTransaction.valor
  const currentType      = updates.type || oldTransaction.type

  if (currentAccountId) {
    const newBalanceChange = currentType === "income" ? currentAmount : -currentAmount
    await db.update(financialAccounts)
      .set({ balance: sql`${financialAccounts.balance} + ${newBalanceChange}` })
      .where(eq(financialAccounts.id, currentAccountId))
  }

  return {
    id: updatedTransaction.id,
    description: updatedTransaction.descricao || "",
    amount: updatedTransaction.valor,
    type: updatedTransaction.type,
    accountId: updatedTransaction.accountId || "",
    date: updatedTransaction.date.toISOString().split("T")[0],
    isPaid: updatedTransaction.isPaid,
  }
}

export async function deleteTransaction(id: string) {
  await getAuthSession()

  if (!id) throw new Error("ID da transação é obrigatório")

  const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id))
  if (!transaction) throw new Error("Transação não encontrada")

  // Reverte o saldo
  if (transaction.accountId) {
    const revertChange = transaction.type === "income" ? -transaction.valor : transaction.valor
    await db.update(financialAccounts)
      .set({ balance: sql`${financialAccounts.balance} + ${revertChange}` })
      .where(eq(financialAccounts.id, transaction.accountId))
  }

  await db.delete(transactions).where(eq(transactions.id, id))
  return { success: true }
}
