import Link from "next/link";
import { notFound } from "next/navigation";
import { loadClientDetail } from "./load";
import { ClientDetailBody } from "./ClientDetailBody";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await loadClientDetail(id);
  if (!client) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/clientes"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para clientes
      </Link>
      <ClientDetailBody client={client} />
    </div>
  );
}
