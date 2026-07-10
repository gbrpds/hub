import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { isAgentConfigured } from "@/lib/anthropic";
import { PageHeader } from "@/components/ui/PageHeader";
import { EstudioIcon } from "@/components/admin/nav-icons";
import { NewChatForm } from "./NewChatForm";

export const dynamic = "force-dynamic";

export default async function EstudioPage() {
  const ownerId = await getCurrentAdminId();

  const [chats, clients] = ownerId
    ? await Promise.all([
        prisma.contentChat.findMany({
          where: { ownerId },
          orderBy: { updatedAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            updatedAt: true,
            client: { select: { name: true } },
            _count: { select: { messages: true } },
          },
        }),
        prisma.client.findMany({
          where: { status: "ATIVO" },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        index="05"
        title="Estúdio de Conteúdo IA"
        description="Converse com o agente para planejar cronogramas, roteiros, carrosséis e legendas — ele já conhece o contexto de cada cliente."
        actions={
          <Link
            href="/admin/estudio/config"
            className="rounded-sm border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Cérebro da marca
          </Link>
        }
      />

      {!isAgentConfigured() && (
        <div className="rounded border border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200/90">
          A chave <code className="font-mono">ANTHROPIC_API_KEY</code> ainda não
          está configurada no servidor. Adicione-a nas variáveis de ambiente da
          Vercel (escopo do projeto) para o agente funcionar.
        </div>
      )}

      <NewChatForm clients={clients} />

      <div className="flex flex-col gap-2">
        <span className="px-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
          Conversas
        </span>
        {chats.length === 0 ? (
          <p className="rounded border border-border bg-surface px-4 py-6 text-sm text-muted">
            Nenhuma conversa ainda. Escolha um cliente acima e comece.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/admin/estudio/${chat.id}`}
                className="group flex items-center justify-between gap-3 rounded border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/60"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gradient-accent/10 text-accent">
                    <EstudioIcon width={16} height={16} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {chat.title}
                    </span>
                    <span className="truncate text-xs text-muted">
                      {chat.client?.name ?? "Brainstorm geral"} ·{" "}
                      {chat._count.messages} mensagens
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {chat.updatedAt.toLocaleDateString("pt-BR")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
