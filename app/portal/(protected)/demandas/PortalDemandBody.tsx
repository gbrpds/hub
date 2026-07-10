import { CLIENT_STATUS_META } from "@/lib/demand-meta";
import { formatDate } from "@/lib/format";
import { DeliveryCarousel } from "./[id]/DeliveryCarousel";
import { ApprovalPanel } from "./[id]/ApprovalPanel";
import type { PortalDemandData } from "./load";

const STATUS_MESSAGE: Record<string, string> = {
  REPROVADO: "Recebemos seu pedido de ajuste e já estamos trabalhando nele.",
  CONCLUIDO: "Este conteúdo já está publicado. 🎉",
  PROGRAMAR: "Aprovado! Já está agendado para publicação.",
};

// Conteúdo do detalhe da demanda no portal (carrossel de entrega + legenda +
// aprovação/status). Reaproveitado pela página inteira e pelo modal.
export function PortalDemandBody({ data }: { data: PortalDemandData }) {
  const meta = CLIENT_STATUS_META[data.status];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
            <span
              className="h-2 w-2 rounded-[1px]"
              style={{ backgroundColor: meta.color }}
            />
            {meta.label}
          </span>
          <span className="ml-auto text-xs text-muted">
            Criada em {formatDate(new Date(data.createdAt))}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {data.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <DeliveryCarousel items={data.delivery} />
          {data.caption && (
            <div className="rounded border border-border bg-surface p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Legenda
              </h2>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {data.caption}
              </p>
            </div>
          )}
        </div>

        <aside>
          {data.status === "APROVACAO" ? (
            <ApprovalPanel demandId={data.id} />
          ) : (
            <div className="rounded border border-border bg-surface p-5 text-sm text-muted">
              {STATUS_MESSAGE[data.status] ??
                "Estamos cuidando do seu conteúdo. Avisaremos quando estiver pronto para sua aprovação."}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
