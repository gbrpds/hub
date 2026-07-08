"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentClientId } from "@/lib/current-user";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

const ALLOWED_PREFIXES = ["image/", "video/"];
const ALLOWED_EXACT = ["application/pdf"];

function isAllowedType(contentType: string) {
  return (
    ALLOWED_PREFIXES.some((p) => contentType.startsWith(p)) ||
    ALLOWED_EXACT.includes(contentType)
  );
}

// Gera um nome de arquivo seguro para virar caminho no Storage.
function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext =
    dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base =
    (dot >= 0 ? name.slice(0, dot) : name)
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "arquivo";
  return ext ? `${base}.${ext}` : base;
}

export type UploadTarget =
  | { ok: true; uploadUrl: string; publicUrl: string }
  | { ok: false; error: string };

// Gera uma URL de upload assinada. O navegador sobe o arquivo DIRETO para o
// Storage usando essa URL — o binário nunca passa pela nossa API.
// Retorna erro estruturado (nunca lança) para que a UI mostre a causa real
// em vez de um 500 genérico.
export async function createUploadUrl(
  fileName: string,
  contentType: string,
): Promise<UploadTarget> {
  try {
    const allowed =
      (await canActAsAdmin()) || (await getCurrentClientId()) != null;
    if (!allowed) return { ok: false, error: "Sem permissão para enviar arquivos." };

    if (!isAllowedType(contentType)) {
      return { ok: false, error: "Tipo de arquivo não permitido." };
    }

    const path = `${Date.now()}-${randomUUID()}-${safeName(fileName)}`;

    // Sem Supabase configurado: em desenvolvimento usa um endpoint mock local
    // que aceita o PUT (armazena em /tmp só para testar o fluxo). Em produção,
    // exige a configuração do Storage.
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      if (process.env.NODE_ENV === "production") {
        return {
          ok: false,
          error:
            "Storage não configurado na Vercel (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
        };
      }
      const mock = `/api/dev-upload/${encodeURIComponent(path)}`;
      return { ok: true, uploadUrl: mock, publicUrl: mock };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return {
        ok: false,
        error: `Supabase: ${error?.message ?? "falha ao gerar URL"} (bucket "${BUCKET}")`,
      };
    }

    // data.signedUrl já é a URL completa de upload (com o token). O navegador
    // faz o PUT direto nela.
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data
      .publicUrl;

    return { ok: true, uploadUrl: data.signedUrl, publicUrl };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado no upload.",
    };
  }
}
