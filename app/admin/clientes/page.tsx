import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  InstagramIcon,
  SendIcon,
  UserCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { ClientesClient, type ClientCard } from "./ClientesClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

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
  const [total, ativos, comInstagram, deliveredThisMonth, clients] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "ATIVO" } }),
      prisma.client.count({ where: { instagrams: { isEmpty: false } } }),
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
          instagrams: true,
          contactWebsite: true,
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
    instagrams: client.instagrams,
    contactWebsite: client.contactWebsite,
    driveUrl: client.driveUrl,
    demandCount: client._count.demands,
  }));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        index="04"
        title="Clientes"
        description="Sua base de clientes."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de clientes"
          value={total}
          icon={<UsersIcon />}
        />
        <StatCard
          label="Ativos"
          value={ativos}
          icon={<UserCheckIcon />}
          tone="accent"
        />
        <StatCard
          label="Entregues no mês"
          value={deliveredThisMonth.length}
          icon={<SendIcon />}
        />
        <StatCard
          label="Com Instagram"
          value={comInstagram}
          icon={<InstagramIcon />}
        />
      </div>

      <div>
        <ClientesClient
          clients={cards}
          hasMore={hasMore}
          nextTake={take + PAGE_SIZE}
        />
      </div>
    </div>
  );
}
