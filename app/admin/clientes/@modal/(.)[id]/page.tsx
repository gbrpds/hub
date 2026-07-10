import { notFound } from "next/navigation";
import { RouteModal } from "@/components/modal/RouteModal";
import { loadClientDetail } from "../../[id]/load";
import { ClientDetailBody } from "../../[id]/ClientDetailBody";

export const dynamic = "force-dynamic";

// Abre a ficha do cliente como popup sobre a lista de clientes.
export default async function ClientModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await loadClientDetail(id);
  if (!client) notFound();

  return (
    <RouteModal
      title={client.name}
      maxWidthClass="max-w-4xl"
      footerNote="✓ Mudanças salvas automaticamente"
    >
      <ClientDetailBody client={client} />
    </RouteModal>
  );
}
