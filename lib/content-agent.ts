import "server-only";
import { prisma } from "@/lib/prisma";
import { CONTENT_TYPE_LABEL } from "@/lib/demand-meta";

// Base de conhecimento que o agente recebe sobre um cliente: o mesmo material
// que o Gabriel colaria à mão num projeto do Claude, montado automaticamente
// a partir do que já está cadastrado (context, serviços, @s e demandas).
async function buildClientKnowledge(clientId: string): Promise<string> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      services: true,
      context: true,
      instagrams: true,
      demands: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          title: true,
          contentType: true,
          status: true,
          caption: true,
          createdAt: true,
        },
      },
    },
  });

  if (!client) return "Cliente não encontrado.";

  const lines: string[] = [`# Cliente: ${client.name}`];

  if (client.services.length) {
    lines.push(`Serviços contratados: ${client.services.join(", ")}`);
  }
  if (client.instagrams.length) {
    lines.push(`Instagram(s): ${client.instagrams.join(", ")}`);
  }
  if (client.context?.trim()) {
    lines.push("", "## Contexto e diretrizes do cliente", client.context.trim());
  }

  if (client.demands.length) {
    lines.push("", "## Conteúdos recentes já produzidos (evite repetir temas)");
    for (const demand of client.demands) {
      const type = demand.contentType
        ? CONTENT_TYPE_LABEL[demand.contentType] ?? demand.contentType
        : "—";
      lines.push(`- [${type}] ${demand.title}`);
    }
  }

  return lines.join("\n");
}

// Monta o system prompt final: metodologia global ("cérebro da marca") +
// base de conhecimento do cliente + instruções de comportamento do agente.
export async function buildSystemPrompt(
  ownerId: string,
  clientId: string | null,
): Promise<string> {
  const config = await prisma.agentConfig.findUnique({ where: { ownerId } });
  const methodology = config?.instructions?.trim();

  const parts: string[] = [
    "Você é o agente de criação de conteúdo do Hub, um estúdio digital de social media.",
    "Fala português do Brasil, em tom próximo, direto e criativo. Você ajuda a planejar e roteirizar conteúdo (cronogramas mensais, roteiros de Reels, carrosséis, posts, legendas e ganchos).",
    "Trabalhe de forma colaborativa: faça perguntas quando faltar contexto, acolha referências que o usuário colar e só entregue ideias quando entender de fato o objetivo.",
    "Quando propuser um conteúdo concreto pronto pra virar demanda, estruture com: título, formato (Post, Carrossel, Reels, Story ou Vídeo longo), gancho/ideia central e uma sugestão de legenda.",
  ];

  if (methodology) {
    parts.push(
      "",
      "## Metodologia de criação (siga sempre esta linha)",
      methodology,
    );
  }

  if (clientId) {
    parts.push("", await buildClientKnowledge(clientId));
  } else {
    parts.push(
      "",
      "Esta conversa não está ligada a um cliente específico — trate como brainstorm geral.",
    );
  }

  return parts.join("\n");
}
