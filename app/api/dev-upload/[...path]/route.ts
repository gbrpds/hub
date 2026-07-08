import { NextRequest } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Endpoint MOCK só de desenvolvimento: recebe o PUT do navegador (simulando o
// Storage) e guarda em /tmp para o preview funcionar. Em produção o upload vai
// direto para o Supabase e este endpoint não é usado.
export const dynamic = "force-dynamic";

const DIR = path.join(os.tmpdir(), "hub-dev-uploads");

function keyFrom(parts: string[]) {
  return encodeURIComponent(parts.join("/"));
}

function contentTypeFor(key: string) {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "avif"].includes(ext))
    return `image/${ext === "jpg" ? "jpeg" : ext}`;
  if (["mp4", "webm", "mov", "ogg"].includes(ext)) return `video/${ext}`;
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;

  // O cliente envia multipart/form-data (igual ao Supabase): o arquivo vem
  // no campo de nome vazio. Fora isso, aceita corpo cru como fallback.
  let buffer: Buffer;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("");
    if (!(file instanceof Blob)) {
      return new Response("no file", { status: 400 });
    }
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    buffer = Buffer.from(await req.arrayBuffer());
  }

  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, keyFrom(parts)), buffer);
  return new Response(null, { status: 200 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const key = keyFrom(parts);
  try {
    const buffer = await readFile(path.join(DIR, key));
    return new Response(new Uint8Array(buffer), {
      headers: { "content-type": contentTypeFor(key) },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
