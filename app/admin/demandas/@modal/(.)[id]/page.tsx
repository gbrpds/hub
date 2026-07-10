import { notFound } from "next/navigation";
import { RouteModal } from "@/components/modal/RouteModal";
import { loadDemandDetail } from "../../[id]/load";
import { DemandDetailBody } from "../../[id]/DemandDetailBody";

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
    <RouteModal
      title="Detalhe da demanda"
      maxWidthClass="max-w-[1240px]"
      footerNote="✓ Mudanças salvas automaticamente"
    >
      <DemandDetailBody data={data} />
    </RouteModal>
  );
}
