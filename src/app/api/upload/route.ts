import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { uploads, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "node:crypto";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Definir caminhos
        const uploadDir = join(process.cwd(), "public", "uploads", "profile-pics");

        // Garantir que a pasta existe
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Pasta já existe
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${randomUUID()}.${fileExt}`;
        const filePath = join(uploadDir, fileName);
        const publicPath = `/uploads/profile-pics/${fileName}`;

        // Salvar no disco
        await writeFile(filePath, buffer);

        // Registrar no banco (uploads)
        const [newUpload] = await db.insert(uploads).values({
            path: filePath,
            publicPath: publicPath,
            rotina: "PROFILE_PIC",
            recordId: session.user.id,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size.toString(),
            status: "active",
            createdBy: session.user.id,
            updatedBy: session.user.id,
        }).returning();

        // Atualizar a imagem do usuário
        await db.update(users)
            .set({ image: publicPath })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            publicPath,
            uploadId: newUpload.id
        });

    } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro interno no servidor";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
