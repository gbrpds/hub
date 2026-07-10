import { notFound } from "next/navigation";
import { RouteModal } from "@/components/modal/RouteModal";
import { getCurrentClientId } from "@/lib/current-user";
import { loadPortalDemand } from "../../load";
import { PortalDemandBody } from "../../PortalDemandBody";

export const dynamic = "force-dynamic";

// Detalhe do conteúdo abre como popup sobre a lista "Meus projetos".
export default async function PortalDemandModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = await getCurrentClientId();
  const data = await loadPortalDemand(id, clientId);
  if (!data) notFound();

  return (
    <RouteModal title="Detalhe do conteúdo" maxWidthClass="max-w-3xl">
      <PortalDemandBody data={data} />
    </RouteModal>
  );
}
