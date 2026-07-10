import { notFound } from "next/navigation";
import { loadDemandDetail } from "../../[id]/load";
import { DemandDetailBody } from "../../[id]/DemandDetailBody";
import { DemandModalShell } from "./DemandModalShell";

export const dynamic = "force-dynamic";

// Rota interceptada: abre o detalhe como popup sobre a lista de demandas
// (navegação soft). Refresh / deep link cai na página inteira em [id]/page.
export default async function DemandModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDemandDetail(id);
  if (!data) notFound();

  return (
    <DemandModalShell>
      <DemandDetailBody data={data} />
    </DemandModalShell>
  );
}
