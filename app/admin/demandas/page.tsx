import { prisma } from "@/lib/prisma";
import type { DemandCard } from "@/lib/demand-meta";
import { DemandasClient } from "./DemandasClient";

// Sem isso o Next.js pode congelar a página como estática no build.
export const dynamic = "force-dynamic";

export default async function DemandasPage() {
  const [demands, clients, users] = await Promise.all([
    prisma.demand.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, photoUrl: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, photoUrl: true },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const cards: DemandCard[] = demands.map((demand) => ({
    id: demand.id,
    title: demand.title,
    description: demand.description,
    status: demand.status,
    priority: demand.priority,
    contentType: demand.contentType,
    dueDate: demand.dueDate ? demand.dueDate.toISOString() : null,
    publishDate: demand.publishDate ? demand.publishDate.toISOString() : null,
    client: demand.client,
    assignee: demand.assignee,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Demandas</h1>
      <p className="mt-2 text-muted">Kanban e lista das demandas do estúdio.</p>
      <div className="mt-6">
        <DemandasClient demands={cards} clients={clients} users={users} />
      </div>
    </div>
  );
}
