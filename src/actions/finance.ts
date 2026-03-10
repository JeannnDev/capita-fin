"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { incomes, categories, transactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUserId() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session?.user?.id;
}

export async function getFinancialSummary(month: number, year: number) {
    const userId = await getUserId();
    if (!userId) {
        return { income: 0, summary: [], totalSpent: 0 };
    }

    const currentIncomes = await db.query.incomes.findMany({
        where: and(
            eq(incomes.userId, userId),
            eq(incomes.mes, month),
            eq(incomes.ano, year)
        ),
    });

    const userCategories = await db.query.categories.findMany({
        where: eq(categories.userId, userId),
    });

    const monthTransactions = await db.query.transactions.findMany({
        where: and(
            eq(transactions.userId, userId),
            sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = ${month}`,
            sql`EXTRACT(YEAR FROM ${transactions.createdAt}) = ${year}`
        )
    });

    const incomeValue = currentIncomes.reduce((sum, i) => sum + i.valor, 0);

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
        incomes: currentIncomes
    };
}

export async function addTransaction(categoryId: string, valor: number, descricao: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(transactions).values({
        userId: userId,
        categoryId,
        valor,
        descricao,
    });
    revalidatePath("/", "layout");
}

export async function upsertIncome(valor: number, month: number, year: number, tipo: string = "Salário") {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const existing = await db.query.incomes.findFirst({
        where: and(
            eq(incomes.userId, userId),
            eq(incomes.mes, month),
            eq(incomes.ano, year),
            eq(incomes.tipo, tipo)
        ),
    });

    if (existing) {
        await db.update(incomes)
            .set({ valor })
            .where(eq(incomes.id, existing.id));
    } else {
        await db.insert(incomes).values({
            userId: userId,
            valor,
            mes: month,
            ano: year,
            tipo
        });
    }
    revalidatePath("/", "layout");
}

export async function getHistoricalData() {
    const userId = await getUserId();
    if (!userId) return [];

    const date = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const monthIncomes = await db.query.incomes.findMany({
            where: and(
                eq(incomes.userId, userId),
                eq(incomes.mes, month),
                eq(incomes.ano, year)
            ),
        });

        const monthTransactions = await db.query.transactions.findMany({
            where: and(
                eq(transactions.userId, userId),
                sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = ${month}`,
                sql`EXTRACT(YEAR FROM ${transactions.createdAt}) = ${year}`
            )
        });

        result.push({
            month: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
            income: monthIncomes.reduce((sum, i) => sum + i.valor, 0),
            spent: monthTransactions.reduce((sum, t) => sum + t.valor, 0),
        });
    }

    return result;
}

export async function initializeDefaultCategories() {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const defaults = [
        { nome: 'Fixas', percentual: 50 },
        { nome: 'Investimentos', percentual: 25 },
        { nome: 'Pessoal', percentual: 15 },
        { nome: 'Reserva', percentual: 10 },
    ];

    await db.insert(categories).values(
        defaults.map(d => ({ ...d, userId: userId }))
    );
    revalidatePath("/", "layout");
}

export async function getTransactions() {
    const userId = await getUserId();
    if (!userId) return [];

    return await db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
        with: {
            category: true
        }
    });
}

export async function getIncomes() {
    const userId = await getUserId();
    if (!userId) return [];

    return await db.query.incomes.findMany({
        where: eq(incomes.userId, userId),
        orderBy: (incomes, { desc }) => [desc(incomes.ano), desc(incomes.mes)],
    });
}

export async function deleteTransaction(id: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    await db.delete(transactions).where(
        and(
            eq(transactions.id, id),
            eq(transactions.userId, userId)
        )
    );
    revalidatePath("/", "layout");
}

export async function updateCategoryPercent(id: string, percentual: number) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    await db.update(categories)
        .set({ percentual })
        .where(
            and(
                eq(categories.id, id),
                eq(categories.userId, userId)
            )
        );
    revalidatePath("/", "layout");
}

export async function addCategory(nome: string, percentual: number) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(categories).values({
        userId,
        nome,
        percentual,
    });
    revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    // We might want to check if there are transactions first, but for simplicity:
    await db.delete(categories).where(
        and(
            eq(categories.id, id),
            eq(categories.userId, userId)
        )
    );
    revalidatePath("/", "layout");
}

export async function getAIInsights() {
    const userId = await getUserId();
    if (!userId) return "Conecte sua conta para receber análises inteligentes.";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "Configure a GEMINI_API_KEY no seu arquivo .env para ativar a IA.";

    try {
        const summary = await getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear());
        const recentTransactions = await db.query.transactions.findMany({
            where: eq(transactions.userId, userId),
            limit: 5,
            orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
            with: { category: true }
        });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            Você é um assistente financeiro pessoal de elite. Analise os dados abaixo e forneça 3 dicas curtas, diretas e impactantes para o usuário.
            A linguagem deve ser motivadora, profissional e ligeiramente informal (como um coach).
            
            DADOS ATUAIS:
            - Renda Mensal: R$ ${summary.income}
            - Gasto Total no Mês: R$ ${summary.totalSpent}
            - Categorias (Nome, Porcentagem Ideal, Gasto Atual, Limite Calculado): 
              ${summary.summary.map((s: any) => `${s.nome}: ${s.percentual}%, Gasto: R$ ${s.gasto}, Limite: R$ ${s.limite}`).join('\n')}
            
            TRANSAÇÕES RECENTES:
            ${recentTransactions.map((t: any) => `- ${t.descricao}: R$ ${t.valor} (${t.category?.nome})`).join('\n')}

            REGRAS:
            1. Seja curto (máximo 2 frases por dica).
            2. Fale sobre limites estourados se houver.
            3. Dê uma dica de economia específica.
            4. Se não houver gastos, incentive a começar a registrar.
            5. Formate a saída como uma lista simples.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erro na IA:", error);
        return "Tive um probleminha para analisar seus dados agora. Tente novamente em breve!";
    }
}
