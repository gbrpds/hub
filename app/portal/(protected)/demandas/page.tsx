import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { DemandasGrid, type PortalDemandCard } from "./DemandasGrid";

export const dynamic = "force-dynamic";

export default async function PortalDemandasPage() {
  const clientId = await getCurrentClientId();

  // Sempre filtra por clientId — nunca mostra demanda de outro cliente.
  // Não trazemos o binário do anexo aqui (data URL pesado): buscamos só a
  // existência de uma entrega. A mídia real carrega na tela de detalhe.
  const demands = clientId
    ? await prisma.demand.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          attachments: {
            where: { type: "ENTREGA" },
            take: 1,
            select: { id: true },
          },
        },
      })
    : [];

  const cards: PortalDemandCard[] = demands.map((demand) => ({
    id: demand.id,
    title: demand.title,
    status: demand.status,
    hasDelivery: demand.attachments.length > 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Meus projetos</h1>
      <p className="mt-2 text-muted">Acompanhe tudo o que estamos criando.</p>

      <div className="mt-6">
        <DemandasGrid demands={cards} />
      </div>
    </div>
  );
}
