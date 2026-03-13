import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    // Monta o caminho físico no disco: <projeto>/uploads/<...path>
    const filePath = join(process.cwd(), "uploads", ...path);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Detectar o tipo do arquivo pela extensão
    const ext = path[path.length - 1].split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    };
    const contentType = contentTypeMap[ext ?? ""] ?? "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
