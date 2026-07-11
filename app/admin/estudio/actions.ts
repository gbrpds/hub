"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentAdminId } from "@/lib/current-user";
import { getGemini, CONTENT_MODEL } from "@/lib/ai";
import type { ContentType } from "@/app/generated/prisma/client";

const CONTENT_TYPES = ["POST", "CARROSSEL", "REELS", "STORY", "VIDEO_LONGO"] as const;

// Cria uma conversa (opcionalmente ligada a um cliente) e leva pra ela.
export async function createChat(formData: FormData) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;

  const clientId = String(formData.get("clientId") ?? "").trim() || null;
  const client = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
      })
    : null;

  const chat = await prisma.contentChat.create({
    data: {
      ownerId,
      clientId,
      title: client ? `Conteúdo — ${client.name}` : "Brainstorm geral",
    },
    select: { id: true },
  });

  revalidatePath("/admin/estudio");
  redirect(`/admin/estudio/${chat.id}`);
}

export async function renameChat(id: string, title: string) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;
  const trimmed = title.trim();
  if (!trimmed) return;
  await prisma.contentChat.updateMany({
    where: { id, ownerId },
    data: { title: trimmed },
  });
  revalidatePath("/admin/estudio");
  revalidatePath(`/admin/estudio/${id}`);
}

export async function deleteChat(id: string) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;
  await prisma.contentChat.deleteMany({ where: { id, ownerId } });
  revalidatePath("/admin/estudio");
  redirect("/admin/estudio");
}

// Salva o "cérebro da marca" (metodologia global de criação).
export async function saveAgentConfig(formData: FormData) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;
  const instructions = String(formData.get("instructions") ?? "").trim();

  await prisma.agentConfig.upsert({
    where: { ownerId },
    create: { ownerId, instructions },
    update: { instructions },
  });

  revalidatePath("/admin/estudio/config");
}

// Extrai uma demanda estruturada de uma mensagem do agente e a cria de verdade
// no sistema (Kanban/calendário), ligada ao cliente da conversa.
export async function createDemandFromMessage(
  chatId: string,
  content: string,
): Promise<{ ok: true; title: string } | { ok: false; error: string }> {
  if (!(await canActAsAdmin())) return { ok: false, error: "Sem permissão." };
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return { ok: false, error: "Sem usuário." };

  const chat = await prisma.contentChat.findFirst({
    where: { id: chatId, ownerId },
    select: { clientId: true },
  });
  if (!chat) return { ok: false, error: "Conversa não encontrada." };

  const gemini = getGemini();
  if (!gemini) return { ok: false, error: "IA não configurada no servidor." };

  let parsed: {
    title: string;
    contentType: string;
    description: string;
    caption: string;
  };

  try {
    const response = await gemini.models.generateContent({
      model: CONTENT_MODEL,
      contents: [{ role: "user", parts: [{ text: content }] }],
      config: {
        systemInstruction:
          "Extraia uma única demanda de conteúdo do texto fornecido. title: nome curto e claro. contentType: um de POST, CARROSSEL, REELS, STORY, VIDEO_LONGO, ou string vazia se não der pra inferir. description: o roteiro/ideia central. caption: legenda sugerida (vazio se não houver).",
        // Extração simples — sem thinking, pra ser rápido e barato.
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            contentType: { type: Type.STRING },
            description: { type: Type.STRING },
            caption: { type: Type.STRING },
          },
          required: ["title", "contentType", "description", "caption"],
        },
      },
    });

    const text = response.text;
    if (!text) return { ok: false, error: "IA não retornou dados." };
    parsed = JSON.parse(text);
  } catch (error) {
    console.error("[content-agent] erro ao criar demanda:", error);
    const detail =
      error instanceof ApiError
        ? `Erro da API (${error.status}): ${error.message}`
        : "Falha ao interpretar a mensagem.";
    return { ok: false, error: detail };
  }

  const title = parsed.title?.trim();
  if (!title) return { ok: false, error: "Não consegui extrair um título." };

  const contentType = (CONTENT_TYPES as readonly string[]).includes(
    parsed.contentType ?? "",
  )
    ? (parsed.contentType as ContentType)
    : null;

  await prisma.demand.create({
    data: {
      title,
      description: parsed.description?.trim() || null,
      caption: parsed.caption?.trim() || null,
      contentType,
      clientId: chat.clientId,
    },
  });

  revalidatePath("/admin/demandas");
  revalidatePath("/admin/dashboard");
  return { ok: true, title };
}
