import { prisma } from "@/lib/prisma";
import type { DemandCard } from "@/lib/demand-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemandasClient } from "./DemandasClient";

// Sem isso o Next.js pode congelar a página como estática no build.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function DemandasPage({
  searchParams,
}: {
  searchParams: Promise<{ take?: string }>;
}) {
  const { take: takeParam } = await searchParams;
  const take = Math.min(Math.max(Number(takeParam) || PAGE_SIZE, PAGE_SIZE), 1000);

  const [demands, clients, users] = await Promise.all([
    prisma.demand.findMany({
      orderBy: { createdAt: "desc" },
      // Busca uma a mais para saber se ainda há próxima página.
      take: take + 1,
      // Só os campos que o kanban/lista usa — nada de description/caption.
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        contentType: true,
        dueDate: true,
        publishDate: true,
        client: { select: { id: true, name: true, photoUrl: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const hasMore = demands.length > take;
  const page = hasMore ? demands.slice(0, take) : demands;

  const cards: DemandCard[] = page.map((demand) => ({
    id: demand.id,
    title: demand.title,
    status: demand.status,
    priority: demand.priority,
    contentType: demand.contentType,
    dueDate: demand.dueDate ? demand.dueDate.toISOString() : null,
    publishDate: demand.publishDate ? demand.publishDate.toISOString() : null,
    client: demand.client,
    assignee: demand.assignee,
  }));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        index="02"
        title="Demandas"
        description="Kanban e lista das demandas do estúdio."
      />
      <div>
        <DemandasClient
          demands={cards}
          clients={clients}
          users={users}
          hasMore={hasMore}
          nextTake={take + PAGE_SIZE}
        />
      </div>
    </div>
  );
}
