import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RouteModal } from "@/components/modal/RouteModal";
import { ModalSkeleton } from "@/components/modal/ModalSkeleton";
import { loadDemandDetail } from "../../[id]/load";
import { DemandDetailBody } from "../../[id]/DemandDetailBody";

export const dynamic = "force-dynamic";

async function DemandBody({ id }: { id: string }) {
  const data = await loadDemandDetail(id);
  if (!data) notFound();
  return <DemandDetailBody data={data} />;
}

// Rota interceptada: o shell do popup aparece na hora e o conteúdo entra
// via streaming (Suspense), então clicar já mostra o modal sem esperar o banco.
export default async function DemandModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteModal
      title="Detalhe da demanda"
      maxWidthClass="max-w-[1240px]"
      footerNote="✓ Mudanças salvas automaticamente"
    >
      <Suspense fallback={<ModalSkeleton columns={3} />}>
        <DemandBody id={id} />
      </Suspense>
    </RouteModal>
  );
}
