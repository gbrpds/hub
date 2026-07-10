import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDemandDetail } from "./load";
import { DemandDetailBody } from "./DemandDetailBody";

export const dynamic = "force-dynamic";

export default async function DemandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDemandDetail(id);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/demandas"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para demandas
      </Link>
      <DemandDetailBody data={data} />
    </div>
  );
}
