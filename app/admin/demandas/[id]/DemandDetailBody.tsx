import { CONTENT_TYPE_LABEL } from "@/lib/demand-meta";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "../parts";
import { InlineFields } from "./InlineFields";
import { TextFields } from "./TextFields";
import { Subtasks } from "./Subtasks";
import { Attachments } from "./Attachments";
import { Comments } from "./Comments";
import { ApprovalButton } from "./ApprovalButton";
import type { DemandDetailData } from "./load";

// Corpo do detalhe da demanda em layout estilo ClickUp: subtarefas +
// propriedades à esquerda, conteúdo no centro, atividade à direita.
// Reaproveitado pela página inteira e pelo modal interceptado.
export function DemandDetailBody({ data }: { data: DemandDetailData }) {
  const {
    detail,
    contentType,
    createdAt,
    subtasks,
    comments,
    clientAttachments,
    deliveryAttachments,
    clients,
    users,
  } = data;

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={detail.status} />
          {contentType && (
            <span className="text-xs uppercase tracking-wide text-muted">
              {CONTENT_TYPE_LABEL[contentType]}
            </span>
          )}
          <span className="ml-auto text-xs text-muted">
            Criada em {formatDate(new Date(createdAt))}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {detail.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)_340px]">
        {/* Esquerda: só subtarefas (estilo ClickUp) */}
        <aside className="flex flex-col gap-4 lg:border-r lg:border-border lg:pr-6">
          <Subtasks demandId={detail.id} subtasks={subtasks} />
        </aside>

        {/* Centro: ação, propriedades, descrição/legenda e anexos */}
        <div className="flex min-w-0 flex-col gap-6">
          <ApprovalButton
            demandId={detail.id}
            disabled={detail.status === "APROVACAO"}
          />
          <InlineFields
            key={`${detail.status}-${detail.assigneeId}-${detail.priority}-${detail.clientId}-${detail.dueDate}-${detail.publishDate}`}
            demand={detail}
            clients={clients}
            users={users}
          />
          <TextFields demand={detail} />
          <Attachments
            demandId={detail.id}
            type="CLIENTE"
            attachments={clientAttachments}
            variant="grid"
          />
          <Attachments
            demandId={detail.id}
            type="ENTREGA"
            attachments={deliveryAttachments}
            variant="carousel"
          />
        </div>

        {/* Direita: atividade / comentários */}
        <div className="lg:border-l lg:border-border lg:pl-6">
          <Comments demandId={detail.id} comments={comments} />
        </div>
      </div>
    </div>
  );
}
