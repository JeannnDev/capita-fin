"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { financialAccounts } from "@/db/schema"
import { eq } from "drizzle-orm"

async function getAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Não autorizado")
  return session
}

export async function createAccount(data: {
  name: string
  balance: number
  type: string
  color?: string
  institution?: string
}) {
  const session = await getAuthSession()

  const [newAccount] = await db.insert(financialAccounts).values({
    userId: session.user.id,
    name: data.name,
    balance: data.balance || 0,
    type: data.type,
    color: data.color || "#8b5cf6",
    institution: data.institution,
  }).returning()

  return {
    id: newAccount.id,
    name: newAccount.name,
    balance: newAccount.balance,
    type: newAccount.type,
    color: newAccount.color,
    institution: newAccount.institution,
  }
}

export async function updateAccount(id: string, updates: {
  name?: string
  balance?: number
  type?: string
  color?: string
  institution?: string
}) {
  await getAuthSession()

  const [updated] = await db.update(financialAccounts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(financialAccounts.id, id))
    .returning()

  return {
    id: updated.id,
    name: updated.name,
    balance: updated.balance,
    type: updated.type,
    color: updated.color,
    institution: updated.institution,
  }
}

export async function deleteAccount(id: string) {
  await getAuthSession()
  await db.delete(financialAccounts).where(eq(financialAccounts.id, id))
  return { success: true }
}
