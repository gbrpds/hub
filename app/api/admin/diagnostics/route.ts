import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Diagnóstico de configuração — não expõe valores de segredos, só se
// cada variável necessária está presente e se o banco responde.
// Útil pra descobrir por que o login está caindo na tela genérica de
// "Server error" do Auth.js (quase sempre falta alguma env var).
//
// force-dynamic: essa rota não usa nada que o Next.js reconheça como
// dinâmico (cookies, params), então sem essa flag ele poderia otimizar
// como página estática e "congelar" a resposta no momento do build.
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    AUTH_SECRET: process.env.AUTH_SECRET ? "configurado" : "FALTANDO",
    DATABASE_URL: process.env.DATABASE_URL ? "configurado" : "FALTANDO",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? "configurado" : "faltando (só usado no seed/bootstrap)",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
      ? "configurado"
      : "faltando (só usado no seed/bootstrap)",
    ADMIN_BOOTSTRAP_SECRET: process.env.ADMIN_BOOTSTRAP_SECRET
      ? "configurado (rota /api/admin/bootstrap ativa)"
      : "não configurado (rota /api/admin/bootstrap desativada)",
    AUTH_DEV_BYPASS:
      process.env.AUTH_DEV_BYPASS === "true"
        ? "ATIVO — login aceita qualquer e-mail/senha"
        : "desativado",
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST
      ? "configurado"
      : "faltando (magic link do CLIENT não vai funcionar)",
    SUPABASE_URL: process.env.SUPABASE_URL
      ? `configurado (host: ${(() => {
          try {
            return new URL(process.env.SUPABASE_URL!).host;
          } catch {
            return "VALOR INVÁLIDO — não é uma URL";
          }
        })()})`
      : "FALTANDO (upload de arquivos não funciona)",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `configurado (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} caracteres)`
      : "FALTANDO (upload de arquivos não funciona)",
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET
      ? `"${process.env.SUPABASE_STORAGE_BUCKET}"`
      : 'não definido — usando "uploads" (padrão)',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      ? `configurado (${process.env.ANTHROPIC_API_KEY.length} caracteres)`
      : "faltando (Estúdio de Conteúdo IA não funciona)",
    VERCEL_ENV: process.env.VERCEL_ENV ?? "não detectado",
    VERCEL: process.env.VERCEL ? "rodando na Vercel" : "não detectado",
  };

  let database = "não testado";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "conectou com sucesso";
  } catch (error) {
    database = `ERRO: ${error instanceof Error ? error.message : String(error)}`;
  }
  checks.DATABASE_CONNECTION = database;

  const missing = Object.entries(checks).filter(([, value]) =>
    value.includes("FALTANDO"),
  );

  const summary =
    missing.length > 0
      ? `Faltam variáveis obrigatórias: ${missing.map(([key]) => key).join(", ")}. Configure na Vercel (Settings → Environment Variables) e faça Redeploy.`
      : "Tudo que é obrigatório está configurado. Se o login ainda falhar, veja os Runtime Logs do deploy na Vercel.";

  return NextResponse.json({ summary, checks }, { status: 200 });
}
