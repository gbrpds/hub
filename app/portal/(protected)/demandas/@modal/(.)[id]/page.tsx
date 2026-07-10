import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RouteModal } from "@/components/modal/RouteModal";
import { ModalSkeleton } from "@/components/modal/ModalSkeleton";
import { getCurrentClientId } from "@/lib/current-user";
import { loadPortalDemand } from "../../load";
import { PortalDemandBody } from "../../PortalDemandBody";

export const dynamic = "force-dynamic";

async function PortalBody({ id }: { id: string }) {
  const clientId = await getCurrentClientId();
  const data = await loadPortalDemand(id, clientId);
  if (!data) notFound();
  return <PortalDemandBody data={data} />;
}

// Detalhe do conteúdo abre como popup; o shell aparece na hora e o conteúdo
// entra via streaming (Suspense).
export default async function PortalDemandModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteModal title="Detalhe do conteúdo" maxWidthClass="max-w-3xl">
      <Suspense fallback={<ModalSkeleton columns={2} />}>
        <PortalBody id={id} />
      </Suspense>
    </RouteModal>
  );
}
