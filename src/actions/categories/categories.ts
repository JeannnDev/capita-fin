"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq, and } from "drizzle-orm"

async function getAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Não autorizado")
  return session
}

export async function createCategory(data: {
  nome: string
  icon?: string
  color?: string
  type?: string
}) {
  const session = await getAuthSession()
  const userId = session.user.id

  // Evita duplicidade
  const existing = await db.select().from(categories).where(
    and(
      eq(categories.userId, userId),
      eq(categories.nome, data.nome),
      eq(categories.type, data.type || "expense"),
    )
  )
  if (existing.length > 0) {
    return {
      id: existing[0].id,
      name: existing[0].nome,
      icon: existing[0].icon,
      color: existing[0].color,
      type: existing[0].type,
    }
  }

  const [newCategory] = await db.insert(categories).values({
    userId,
    nome: data.nome,
    icon: data.icon || "tag",
    color: data.color || "#8b5cf6",
    type: data.type || "expense",
  }).returning()

  return {
    id: newCategory.id,
    name: newCategory.nome,
    icon: newCategory.icon,
    color: newCategory.color,
    type: newCategory.type,
  }
}
