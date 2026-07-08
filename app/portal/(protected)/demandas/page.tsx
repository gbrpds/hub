import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { mediaKind } from "@/lib/media";
import { DemandasGrid, type PortalDemandCard } from "./DemandasGrid";

export const dynamic = "force-dynamic";

export default async function PortalDemandasPage() {
  const clientId = await getCurrentClientId();

  // Sempre filtra por clientId — nunca mostra demanda de outro cliente.
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
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { url: true, fileName: true },
          },
        },
      })
    : [];

  const cards: PortalDemandCard[] = demands.map((demand) => {
    const preview = demand.attachments[0];
    return {
      id: demand.id,
      title: demand.title,
      status: demand.status,
      previewUrl: preview?.url ?? null,
      previewKind: preview ? mediaKind(preview.url, preview.fileName) : null,
    };
  });

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
