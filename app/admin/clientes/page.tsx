import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { ClientesClient, type ClientCard } from "./ClientesClient";

export const dynamic = "force-dynamic";

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

export default async function ClientesPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [clients, deliveredThisMonth] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { demands: true } } },
    }),
    prisma.demand.findMany({
      where: {
        status: "CONCLUIDO",
        clientId: { not: null },
        updatedAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
      select: { clientId: true },
      distinct: ["clientId"],
    }),
  ]);

  const total = clients.length;
  const ativos = clients.filter((client) => client.status === "ATIVO").length;
  const comWhatsapp = clients.filter((client) => client.whatsappGroupUrl).length;

  const cards: ClientCard[] = clients.map((client) => ({
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
        <ClientesClient clients={cards} />
      </div>
    </div>
  );
}
