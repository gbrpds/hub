import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentAdminId } from "@/lib/current-user";
import { getAnthropic, CONTENT_MODEL } from "@/lib/anthropic";
import { buildSystemPrompt } from "@/lib/content-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Recebe { chatId, message }, persiste a mensagem do usuário, monta o system
// prompt com a base de conhecimento do cliente e devolve a resposta do agente
// em streaming (texto puro). Ao terminar, persiste a resposta do assistente.
export async function POST(request: Request) {
  if (!(await canActAsAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const anthropic = getAnthropic();
  if (!anthropic) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 503 },
    );
  }

  const ownerId = await getCurrentAdminId();
  if (!ownerId) {
    return NextResponse.json({ error: "Sem usuário admin." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    chatId?: string;
    message?: string;
  } | null;

  const chatId = body?.chatId?.trim();
  const message = body?.message?.trim();
  if (!chatId || !message) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const chat = await prisma.contentChat.findFirst({
    where: { id: chatId, ownerId },
    select: { id: true, clientId: true },
  });
  if (!chat) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  // Persiste a mensagem do usuário e carrega o histórico completo.
  await prisma.contentMessage.create({
    data: { chatId: chat.id, role: "USER", content: message },
  });

  const history = await prisma.contentMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  const system = await buildSystemPrompt(ownerId, chat.clientId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        const llm = anthropic.messages.stream({
          model: CONTENT_MODEL,
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          system,
          messages,
        });

        for await (const event of llm) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        await llm.finalMessage();
      } catch (error) {
        console.error("[content-agent] erro na geração:", error);
        let detail = "Erro ao gerar resposta.";
        if (error instanceof Anthropic.APIError) {
          // Mostra a mensagem real da API (ex.: saldo insuficiente, modelo
          // sem acesso) — é o que permite diagnosticar um 400.
          const apiMessage =
            (error.error as { error?: { message?: string } })?.error?.message ??
            error.message;
          detail = `Erro da API (${error.status}): ${apiMessage}`;
        }
        controller.enqueue(encoder.encode(`\n\n⚠️ ${detail}`));
        full += `\n\n⚠️ ${detail}`;
      } finally {
        // Salva a resposta do assistente (mesmo parcial) e atualiza o chat.
        if (full.trim()) {
          await prisma.contentMessage.create({
            data: { chatId: chat.id, role: "ASSISTANT", content: full },
          });
          await prisma.contentChat.update({
            where: { id: chat.id },
            data: { updatedAt: new Date() },
          });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
