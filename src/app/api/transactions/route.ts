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

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const { id, ...updates } = data;

        if (!id) {
            return NextResponse.json({ error: "ID da transação é obrigatório" }, { status: 400 });
        }

        // Get old transaction to revert balance
        const [oldTransaction] = await db.select().from(transactions).where(eq(transactions.id, id));
        if (!oldTransaction) {
            return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
        }

        // Revert old balance
        if (oldTransaction.accountId) {
            const oldRevertChange = oldTransaction.type === 'income' ? -oldTransaction.valor : oldTransaction.valor;
            await db.update(financialAccounts)
                .set({ balance: sql`${financialAccounts.balance} + ${oldRevertChange}` })
                .where(eq(financialAccounts.id, oldTransaction.accountId));
        }

        // Update transaction
        const updateData: {
            descricao?: string;
            valor?: number;
            type?: "income" | "expense";
            categoryId?: string;
            accountId?: string;
            date?: Date;
            mes?: number;
            ano?: number;
            isPaid?: boolean;
        } = {};
        if (updates.description !== undefined) updateData.descricao = updates.description;
        if (updates.amount !== undefined) updateData.valor = updates.amount;
        if (updates.type !== undefined) updateData.type = updates.type;
        if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
        if (updates.accountId !== undefined) updateData.accountId = updates.accountId;
        if (updates.date !== undefined) {
            const newDate = new Date(updates.date);
            updateData.date = newDate;
            updateData.mes = newDate.getMonth();
            updateData.ano = newDate.getFullYear();
        }
        if (updates.isPaid !== undefined) updateData.isPaid = updates.isPaid;

        const [updatedTransaction] = await db.update(transactions)
            .set(updateData)
            .where(eq(transactions.id, id))
            .returning();

        // Apply new balance
        const currentAccountId = updates.accountId || oldTransaction.accountId;
        const currentAmount = updates.amount !== undefined ? updates.amount : oldTransaction.valor;
        const currentType = updates.type || oldTransaction.type;

        if (currentAccountId) {
            const newBalanceChange = currentType === 'income' ? currentAmount : -currentAmount;
            await db.update(financialAccounts)
                .set({ balance: sql`${financialAccounts.balance} + ${newBalanceChange}` })
                .where(eq(financialAccounts.id, currentAccountId));
        }

        return NextResponse.json(updatedTransaction);
    } catch (error) {
        console.error("Transaction update error:", error);
        return NextResponse.json({ error: "Erro ao atualizar transação" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID da transação é obrigatório" }, { status: 400 });
        }

        // Get transaction to revert balance
        const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
        if (!transaction) {
            return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
        }

        // Revert balance
        if (transaction.accountId) {
            const revertChange = transaction.type === 'income' ? -transaction.valor : transaction.valor;
            await db.update(financialAccounts)
                .set({ balance: sql`${financialAccounts.balance} + ${revertChange}` })
                .where(eq(financialAccounts.id, transaction.accountId));
        }

        await db.delete(transactions).where(eq(transactions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Transaction deletion error:", error);
        return NextResponse.json({ error: "Erro ao excluir transação" }, { status: 500 });
    }
}
