"use server";

import { db } from "@/db";
import { incomes, categories, transactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function getFinancialSummary(month: number, year: number) {
    const currentIncome = await db.query.incomes.findFirst({
        where: and(
            eq(incomes.userId, DEFAULT_USER_ID),
            eq(incomes.mes, month),
            eq(incomes.ano, year)
        ),
    });

    const userCategories = await db.query.categories.findMany({
        where: eq(categories.userId, DEFAULT_USER_ID),
    });

    const monthTransactions = await db.query.transactions.findMany({
        where: and(
            eq(transactions.userId, DEFAULT_USER_ID),
            sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = ${month}`,
            sql`EXTRACT(YEAR FROM ${transactions.createdAt}) = ${year}`
        )
    });

    const incomeValue = currentIncome?.valor || 0;

    const summary = userCategories.map((cat) => {
        const categoryGasto = monthTransactions
            .filter((t) => t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.valor, 0);

        const limit = (incomeValue * cat.percentual) / 100;

        return {
            id: cat.id,
            nome: cat.nome,
            percentual: cat.percentual,
            limite: limit,
            gasto: categoryGasto,
        };
    });

    return {
        income: incomeValue,
        summary,
        totalSpent: monthTransactions.reduce((sum, t) => sum + t.valor, 0),
    };
}

export async function addTransaction(categoryId: string, valor: number, descricao: string) {
    await db.insert(transactions).values({
        userId: DEFAULT_USER_ID,
        categoryId,
        valor,
        descricao,
    });
    revalidatePath("/");
}

export async function upsertIncome(valor: number, month: number, year: number) {
    const existing = await db.query.incomes.findFirst({
        where: and(
            eq(incomes.userId, DEFAULT_USER_ID),
            eq(incomes.mes, month),
            eq(incomes.ano, year)
        ),
    });

    if (existing) {
        await db.update(incomes)
            .set({ valor })
            .where(eq(incomes.id, existing.id));
    } else {
        await db.insert(incomes).values({
            userId: DEFAULT_USER_ID,
            valor,
            mes: month,
            ano: year,
        });
    }
    revalidatePath("/");
}

export async function initializeDefaultCategories() {
    const defaults = [
        { nome: 'Fixas', percentual: 50 },
        { nome: 'Investimentos', percentual: 25 },
        { nome: 'Pessoal', percentual: 15 },
        { nome: 'Reserva', percentual: 10 },
    ];

    await db.insert(categories).values(
        defaults.map(d => ({ ...d, userId: DEFAULT_USER_ID }))
    );
    revalidatePath("/");
}
