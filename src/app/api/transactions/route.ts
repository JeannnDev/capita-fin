import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions, financialAccounts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const userId = session.user.id;

        const [newTransaction] = await db.insert(transactions).values({
            userId,
            accountId: data.accountId,
            categoryId: data.categoryId,
            valor: data.amount,
            descricao: data.description,
            type: data.type,
            date: new Date(data.date),
            mes: new Date(data.date).getMonth(),
            ano: new Date(data.date).getFullYear(),
            isPaid: data.isPaid ?? true,
        }).returning();

        // Update account balance
        if (data.accountId) {
            const balanceChange = data.type === 'income' ? data.amount : -data.amount;
            await db.update(financialAccounts)
                .set({ 
                    balance: sql`${financialAccounts.balance} + ${balanceChange}`,
                    updatedAt: new Date()
                })
                .where(eq(financialAccounts.id, data.accountId));
        }

        // Return mapped object to match Transaction interface
        const responseData = {
            id: newTransaction.id,
            description: newTransaction.descricao || "",
            amount: newTransaction.valor,
            type: newTransaction.type,
            category: data.category || "Geral", // From req or fetch name
            accountId: newTransaction.accountId || "",
            date: newTransaction.date.toISOString().split('T')[0],
            isPaid: newTransaction.isPaid
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Transaction creation error:", error);
        return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 });
    }
}
