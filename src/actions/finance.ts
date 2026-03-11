"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { categories, transactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

    const monthTransactions = await db.query.transactions.findMany({
        where: and(
            eq(transactions.userId, userId),
            eq(transactions.mes, month),
            eq(transactions.ano, year)
        ),
    });

    const userCategories = await db.query.categories.findMany({
        where: eq(categories.userId, userId),
    });

    const currentIncomes = monthTransactions.filter(t => t.type === 'income');
    const incomeValue = currentIncomes.reduce((sum, i) => sum + i.valor, 0);
    const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');

    const summary = userCategories
        .filter(cat => cat.type === 'expense')
        .map((cat) => {
            const categoryGasto = expenseTransactions
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
        totalSpent: expenseTransactions.reduce((sum, t) => sum + t.valor, 0),
        incomes: currentIncomes.map(i => ({ ...i, tipo: i.descricao || "Salário" }))
    };
}

export async function addTransaction(categoryId: string, valor: number, descricao: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const now = new Date();
    await db.insert(transactions).values({
        userId: userId,
        categoryId,
        valor,
        descricao,
        mes: now.getMonth() + 1,
        ano: now.getFullYear(),
        type: 'expense'
    });
    revalidatePath("/", "layout");
}

export async function upsertIncome(valor: number, month: number, year: number, tipo: string = "Salário") {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const existing = await db.query.transactions.findFirst({
        where: and(
            eq(transactions.userId, userId),
            eq(transactions.mes, month),
            eq(transactions.ano, year),
            eq(transactions.type, "income"),
            eq(transactions.descricao, tipo)
        ),
    });

    if (existing) {
        await db.update(transactions)
            .set({ valor })
            .where(eq(transactions.id, existing.id));
    } else {
        await db.insert(transactions).values({
            userId: userId,
            valor,
            mes: month,
            ano: year,
            descricao: tipo,
            type: "income"
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

        const monthTransactions = await db.query.transactions.findMany({
            where: and(
                eq(transactions.userId, userId),
                eq(transactions.mes, month),
                eq(transactions.ano, year)
            )
        });

        const monthIncomes = monthTransactions.filter(t => t.type === 'income');
        const monthExpenses = monthTransactions.filter(t => t.type === 'expense');

        result.push({
            month: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
            income: monthIncomes.reduce((sum, i) => sum + i.valor, 0),
            spent: monthExpenses.reduce((sum, t) => sum + t.valor, 0),
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
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        with: {
            category: true
        }
    });
}

export async function getIncomes() {
    const userId = await getUserId();
    if (!userId) return [];

    const data = await db.query.transactions.findMany({
        where: and(
            eq(transactions.userId, userId),
            eq(transactions.type, "income")
        ),
        orderBy: (t, { desc }) => [desc(t.ano), desc(t.mes)],
    });

    return data.map(i => ({ ...i, tipo: i.descricao || "Salário" }));
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
        interface SummaryItem {
            nome: string;
            percentual: number;
            gasto: number;
            limite: number;
        }

        interface TransactionWithCategory {
            descricao: string | null;
            valor: number;
            category: {
                nome: string;
            } | null;
        }

        const summary = await getFinancialSummary(new Date().getMonth() + 1, new Date().getFullYear());
        const recentTransactions = await db.query.transactions.findMany({
            where: eq(transactions.userId, userId),
            limit: 5,
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            with: { category: true }
        }) as TransactionWithCategory[];

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            Você é um assistente financeiro pessoal de elite. Analise os dados abaixo e forneça 3 dicas curtas, diretas e impactantes para o usuário.
            A linguagem deve ser motivadora, profissional e ligeiramente informal (como um coach).
            
            DADOS ATUAIS:
            - Renda Mensal: R$ ${summary.income}
            - Gasto Total no Mês: R$ ${summary.totalSpent}
            - Categorias (Nome, Porcentagem Ideal, Gasto Atual, Limite Calculado): 
              ${summary.summary.map((s: SummaryItem) => `${s.nome}: ${s.percentual}%, Gasto: R$ ${s.gasto}, Limite: R$ ${s.limite}`).join('\n')}
            
            TRANSAÇÕES RECENTES:
            ${recentTransactions.map((t: TransactionWithCategory) => `- ${t.descricao}: R$ ${t.valor} (${t.category?.nome})`).join('\n')}

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
