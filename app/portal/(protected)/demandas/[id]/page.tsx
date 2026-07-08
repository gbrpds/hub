import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { mediaKind } from "@/lib/media";
import { CLIENT_STATUS_META } from "@/lib/demand-meta";
import { DeliveryCarousel, type DeliveryItem } from "./DeliveryCarousel";
import { ApprovalPanel } from "./ApprovalPanel";

export const dynamic = "force-dynamic";

export default async function PortalDemandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = await getCurrentClientId();

  // Só busca se a demanda for do cliente logado — bloqueia acesso a
  // demandas de outros clientes.
  const demand = clientId
    ? await prisma.demand.findFirst({
        where: { id, clientId },
        select: {
          id: true,
          title: true,
          status: true,
          caption: true,
          attachments: {
            where: { type: "ENTREGA" },
            orderBy: { createdAt: "asc" },
            select: { url: true, fileName: true },
          },
        },
      })
    : null;

  if (!demand) notFound();

  const meta = CLIENT_STATUS_META[demand.status];
  const delivery: DeliveryItem[] = demand.attachments.map((attachment) => ({
    url: attachment.url,
    fileName: attachment.fileName,
    kind: mediaKind(attachment.url, attachment.fileName),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/portal/demandas"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Voltar
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{demand.title}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
            <span
              className="h-2 w-2 rounded-[1px]"
              style={{ backgroundColor: meta.color }}
            />
            {meta.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <DeliveryCarousel items={delivery} />
          {demand.caption && (
            <div className="rounded border border-border bg-surface p-4">
              <h2 className="mb-2 text-sm font-bold tracking-tight text-foreground">
                Legenda
              </h2>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {demand.caption}
              </p>
            </div>
          )}
        </div>

        <aside>
          {demand.status === "APROVACAO" ? (
            <ApprovalPanel demandId={demand.id} />
          ) : (
            <div className="rounded border border-border bg-surface p-4 text-sm text-muted">
              {demand.status === "REPROVADO"
                ? "Recebemos seu pedido de ajuste e já estamos trabalhando nele."
                : demand.status === "CONCLUIDO"
                  ? "Este conteúdo já está publicado. 🎉"
                  : demand.status === "PROGRAMAR"
                    ? "Aprovado! Já está agendado para publicação."
                    : "Estamos cuidando do seu conteúdo. Avisaremos quando estiver pronto para sua aprovação."}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
