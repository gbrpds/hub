import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import {
  ArrowRightIcon,
  CalendarIcon,
  TargetIcon,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

// Status de produção derivado das demandas em andamento do cliente.
const IN_PROGRESS = ["RECEBIDA", "EM_PRODUCAO", "APROVACAO", "PROGRAMAR"] as const;

export default async function CronogramaPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const clients = await prisma.client.findMany({
    where: { status: "ATIVO" },
    orderBy: { name: "asc" },
    // Só o que os cards usam — evita trazer context, contatos e campos
    // financeiros de todos os clientes.
    select: {
      id: true,
      name: true,
      photoUrl: true,
      demands: {
        select: {
          status: true,
          publishDate: true,
          dueDate: true,
        },
      },
    },
  });

  const cards = clients.map((client) => {
    const inProgress = client.demands.filter((demand) =>
      (IN_PROGRESS as readonly string[]).includes(demand.status),
    ).length;

    // Publicações do mês: demandas cuja data de referência (publicação, ou
    // entrega como fallback) cai no mês corrente.
    const monthDemands = client.demands.filter((demand) => {
      const ref = demand.publishDate ?? demand.dueDate;
      return ref && ref >= startOfMonth && ref < startOfNextMonth;
    });
    const approved = client.demands.filter(
      (demand) => demand.status === "CONCLUIDO",
    ).length;
    const decided = client.demands.filter((demand) =>
      ["CONCLUIDO", "REPROVADO"].includes(demand.status),
    ).length;
    const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;

    // Última publicação: maior data de referência entre demandas concluídas.
    const publishedDates = client.demands
      .filter((demand) => demand.status === "CONCLUIDO")
      .map((demand) => demand.publishDate ?? demand.dueDate)
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime());
    const lastPublish = publishedDates[0] ?? null;

    return {
      id: client.id,
      name: client.name,
      photoUrl: client.photoUrl,
      inProgress,
      monthCount: monthDemands.length,
      approvalRate,
      decided,
      lastPublish,
    };
  });

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        index="03"
        title="Cronograma"
        description="Escolha um cliente para ver o calendário."
      />

      {cards.length === 0 ? (
        <p className="text-sm text-muted">Nenhum cliente ativo.</p>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem
              key={card.id}
              className="flex flex-col gap-4 rounded border border-border bg-surface p-6 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center gap-3">
                <Avatar name={card.name} photoUrl={card.photoUrl} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{card.name}</p>
                  <p className="text-xs text-muted">
                    {card.inProgress > 0 ? (
                      <Badge variant="accent">{card.inProgress} em produção</Badge>
                    ) : (
                      <Badge variant="outline">Sem produção ativa</Badge>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-surface-hover text-muted">
                    <CalendarIcon width={16} height={16} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted">
                      No mês
                    </p>
                    <p className="font-bold text-foreground">{card.monthCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-accent/25 bg-accent/10 text-accent">
                    <TargetIcon width={16} height={16} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted">
                      Aprovado
                    </p>
                    <p className="font-bold text-foreground">
                      {card.decided > 0 ? `${card.approvalRate}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted">
                Última publicação:{" "}
                {card.lastPublish ? formatDate(card.lastPublish) : "—"}
              </p>

              <Link
                href={`/admin/cronograma/${card.id}`}
                className="mt-auto flex items-center justify-center gap-1.5 rounded-sm bg-gradient-accent px-3 py-2 text-center text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
              >
                Abrir cronograma
                <ArrowRightIcon width={15} height={15} />
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
