import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RouteModal } from "@/components/modal/RouteModal";
import { ModalSkeleton } from "@/components/modal/ModalSkeleton";
import { loadClientDetail } from "../../[id]/load";
import { ClientDetailBody } from "../../[id]/ClientDetailBody";

export const dynamic = "force-dynamic";

async function ClientBody({ id }: { id: string }) {
  const client = await loadClientDetail(id);
  if (!client) notFound();
  return <ClientDetailBody client={client} />;
}

// Abre a ficha do cliente como popup; o shell aparece na hora e o conteúdo
// entra via streaming (Suspense).
export default async function ClientModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteModal
      title="Ficha do cliente"
      maxWidthClass="max-w-4xl"
      footerNote="✓ Mudanças salvas automaticamente"
    >
      <Suspense fallback={<ModalSkeleton columns={2} />}>
        <ClientBody id={id} />
      </Suspense>
    </RouteModal>
  );
}
