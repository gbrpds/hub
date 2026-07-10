import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CronogramaClient,
  type CalendarDemand,
} from "@/app/admin/cronograma/[clientId]/CronogramaClient";

export const dynamic = "force-dynamic";

export default async function PortalCronogramaPage() {
  const clientId = await getCurrentClientId();

  const rawDemands = clientId
    ? await prisma.demand.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          publishDate: true,
          dueDate: true,
        },
      })
    : [];

  const demands: CalendarDemand[] = rawDemands.map((demand) => {
    const ref = demand.publishDate ?? demand.dueDate;
    return {
      id: demand.id,
      title: demand.title,
      status: demand.status,
      refKey: ref ? ref.toISOString().slice(0, 10) : null,
    };
  });

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Cronograma"
        description="Veja quando cada conteúdo sai."
      />
      <div>
        {/* Mesmo calendário do admin, porém apontando para o detalhe do
            portal (somente leitura — o cliente só clica para ver). */}
        <CronogramaClient demands={demands} hrefBase="/portal/demandas" />
      </div>
    </div>
  );
}
