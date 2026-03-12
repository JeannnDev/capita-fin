import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { financialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const userId = session.user.id;

        const [newAccount] = await db.insert(financialAccounts).values({
            userId,
            name: data.name,
            balance: data.balance || 0,
            type: data.type,
            color: data.color || "#8b5cf6",
            institution: data.institution,
        }).returning();

        return NextResponse.json(newAccount);

    } catch (error) {
        console.error("Account creation error:", error);
        return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
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

        const [updatedAccount] = await db.update(financialAccounts)
            .set({ 
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(financialAccounts.id, id))
            .returning();

        return NextResponse.json(updatedAccount);

    } catch (error) {
        console.error("Account update error:", error);
        return NextResponse.json({ error: "Erro ao atualizar conta" }, { status: 500 });
    }
}
