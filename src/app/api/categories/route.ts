import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const userId = session.user.id;

        // Check if category already exists for this user
        const existing = await db.select()
            .from(categories)
            .where(
                and(
                    eq(categories.userId, userId),
                    eq(categories.nome, data.nome),
                    eq(categories.type, data.type || 'expense')
                )
            );

        if (existing.length > 0) {
            return NextResponse.json(existing[0]);
        }

        const [newCategory] = await db.insert(categories).values({
            userId,
            nome: data.nome,
            icon: data.icon || "tag",
            color: data.color || "#8b5cf6",
            type: data.type || "expense",
        }).returning();

        return NextResponse.json(newCategory);

    } catch (error) {
        console.error("Category creation error:", error);
        return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
    }
}
