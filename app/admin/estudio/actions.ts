"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentAdminId } from "@/lib/current-user";
import { getAnthropic, CONTENT_MODEL } from "@/lib/anthropic";
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

  const anthropic = getAnthropic();
  if (!anthropic) return { ok: false, error: "IA não configurada no servidor." };

  let parsed: {
    title: string;
    contentType: string | null;
    description: string;
    caption: string;
  };

  try {
    const response = await anthropic.messages.create({
      model: CONTENT_MODEL,
      max_tokens: 2000,
      system:
        "Extraia uma única demanda de conteúdo do texto fornecido. title: nome curto e claro. contentType: um de POST, CARROSSEL, REELS, STORY, VIDEO_LONGO, ou null se não der pra inferir. description: o roteiro/ideia central. caption: legenda sugerida (vazio se não houver). Responda apenas no formato pedido.",
      messages: [{ role: "user", content }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              contentType: {
                type: ["string", "null"],
                enum: [...CONTENT_TYPES, null],
              },
              description: { type: "string" },
              caption: { type: "string" },
            },
            required: ["title", "contentType", "description", "caption"],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "IA não retornou dados." };
    }
    parsed = JSON.parse(textBlock.text);
  } catch (error) {
    const detail =
      error instanceof Anthropic.APIError
        ? `Erro da API (${error.status}).`
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
