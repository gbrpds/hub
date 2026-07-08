import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { ClientesClient, type ClientCard } from "./ClientesClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ take?: string }>;
}) {
  const { take: takeParam } = await searchParams;
  const take = Math.min(Math.max(Number(takeParam) || PAGE_SIZE, PAGE_SIZE), 1000);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Contadores do topo via count (independentes da paginação da lista).
  const [total, ativos, comWhatsapp, deliveredThisMonth, clients] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "ATIVO" } }),
      prisma.client.count({ where: { whatsappGroupUrl: { not: null } } }),
      prisma.demand.findMany({
        where: {
          status: "CONCLUIDO",
          clientId: { not: null },
          updatedAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
        select: { clientId: true },
        distinct: ["clientId"],
      }),
      prisma.client.findMany({
        orderBy: { name: "asc" },
        take: take + 1,
        // Só o que o card usa — nada de `context` (texto grande) ou campos
        // financeiros/de contato que a listagem não mostra.
        select: {
          id: true,
          name: true,
          photoUrl: true,
          status: true,
          services: true,
          contactInstagram: true,
          whatsappGroupUrl: true,
          driveUrl: true,
          _count: { select: { demands: true } },
        },
      }),
    ]);

  const hasMore = clients.length > take;
  const page = hasMore ? clients.slice(0, take) : clients;

  const cards: ClientCard[] = page.map((client) => ({
    id: client.id,
    name: client.name,
    photoUrl: client.photoUrl,
    status: client.status,
    services: client.services,
    contactInstagram: client.contactInstagram,
    whatsappGroupUrl: client.whatsappGroupUrl,
    driveUrl: client.driveUrl,
    demandCount: client._count.demands,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
      <p className="mt-2 text-muted">Sua base de clientes.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Total de clientes" value={total} />
        <SummaryCard label="Ativos" value={ativos} />
        <SummaryCard label="Entregues no mês" value={deliveredThisMonth.length} />
        <SummaryCard label="Com WhatsApp" value={comWhatsapp} />
      </div>

      <div className="mt-6">
        <ClientesClient
          clients={cards}
          hasMore={hasMore}
          nextTake={take + PAGE_SIZE}
        />
      </div>
    </div>
  );
}
