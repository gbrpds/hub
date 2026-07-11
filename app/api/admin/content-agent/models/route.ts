import { NextResponse } from "next/server";
import { ApiError } from "@google/genai";
import { canActAsAdmin } from "@/lib/guards";
import { getGemini, CONTENT_MODEL } from "@/lib/ai";

export const dynamic = "force-dynamic";

// Lista os modelos que a chave GEMINI_API_KEY tem acesso e que suportam
// geração de conteúdo. Útil quando o modelo padrão foi aposentado: veja aqui
// um nome válido e (se precisar) fixe em GEMINI_MODEL nas envs da Vercel.
export async function GET() {
  if (!(await canActAsAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const gemini = getGemini();
  if (!gemini) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor." },
      { status: 503 },
    );
  }

  try {
    const pager = await gemini.models.list();
    const models: { name: string; displayName?: string }[] = [];

    for await (const model of pager) {
      // Só os que geram conteúdo (exclui embeddings, tuning, etc.).
      if (model.supportedActions?.includes("generateContent")) {
        models.push({
          name: (model.name ?? "").replace(/^models\//, ""),
          displayName: model.displayName,
        });
      }
    }

    return NextResponse.json({
      modeloAtual: CONTENT_MODEL,
      dica: "Se o modelo atual não estiver na lista, escolha um daqui e defina GEMINI_MODEL nas variáveis de ambiente da Vercel.",
      totalDisponivel: models.length,
      modelos: models,
    });
  } catch (error) {
    const detail =
      error instanceof ApiError
        ? `Erro da API (${error.status}): ${error.message}`
        : "Erro ao listar modelos.";
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
