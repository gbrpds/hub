import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

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
    include: {
      demands: {
        select: {
          status: true,
          publishDate: true,
          dueDate: true,
          updatedAt: true,
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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Cronograma</h1>
      <p className="mt-2 text-muted">Escolha um cliente para ver o calendário.</p>

      {cards.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nenhum cliente ativo.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-3 rounded border border-border bg-surface p-4"
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

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Publicações no mês
                  </p>
                  <p className="font-bold text-foreground">{card.monthCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    % aprovado
                  </p>
                  <p className="font-bold text-foreground">
                    {card.decided > 0 ? `${card.approvalRate}%` : "—"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted">
                Última publicação:{" "}
                {card.lastPublish ? formatDate(card.lastPublish) : "—"}
              </p>

              <Link
                href={`/admin/cronograma/${card.id}`}
                className="mt-auto rounded-sm bg-accent px-3 py-2 text-center text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Abrir cronograma
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
