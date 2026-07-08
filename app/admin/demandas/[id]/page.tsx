import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONTENT_TYPE_LABEL } from "@/lib/demand-meta";
import type { ClientOption, UserOption } from "@/lib/demand-meta";
import { InlineFields } from "./InlineFields";
import { TextFields } from "./TextFields";
import { Subtasks } from "./Subtasks";
import { Attachments } from "./Attachments";
import { Comments } from "./Comments";
import { ApprovalButton } from "./ApprovalButton";
import type {
  DetailDemand,
  SubtaskItem,
  CommentItem,
  AttachmentItem,
} from "./types";

export const dynamic = "force-dynamic";

export default async function DemandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [demand, clients, users] = await Promise.all([
    prisma.demand.findUnique({
      where: { id },
      include: {
        subtasks: { orderBy: { createdAt: "asc" } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true, email: true } } },
        },
        attachments: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, photoUrl: true },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!demand) notFound();

  const detail: DetailDemand = {
    id: demand.id,
    title: demand.title,
    description: demand.description,
    caption: demand.caption,
    status: demand.status,
    priority: demand.priority,
    contentType: demand.contentType,
    clientId: demand.clientId,
    assigneeId: demand.assigneeId,
    dueDate: demand.dueDate ? demand.dueDate.toISOString() : null,
    publishDate: demand.publishDate ? demand.publishDate.toISOString() : null,
  };

  const subtasks: SubtaskItem[] = demand.subtasks.map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    done: subtask.done,
  }));

  const comments: CommentItem[] = demand.comments.map((comment) => ({
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    author: comment.author,
  }));

  const attachments: AttachmentItem[] = demand.attachments.map((attachment) => ({
    id: attachment.id,
    url: attachment.url,
    fileName: attachment.fileName,
    type: attachment.type,
  }));

  const clientAttachments = attachments.filter((a) => a.type === "CLIENTE");
  const deliveryAttachments = attachments.filter((a) => a.type === "ENTREGA");

  const clientOptions: ClientOption[] = clients;
  const userOptions: UserOption[] = users;

  return (
    <div>
      <Link
        href="/admin/demandas"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para demandas
      </Link>

      <div className="mt-3 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{demand.title}</h1>
        {demand.contentType && (
          <span className="text-sm text-muted">
            {CONTENT_TYPE_LABEL[demand.contentType]}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-8">
          <TextFields demand={detail} />
          <Subtasks demandId={demand.id} subtasks={subtasks} />
          <Attachments
            demandId={demand.id}
            type="CLIENTE"
            attachments={clientAttachments}
            variant="grid"
          />
          <Attachments
            demandId={demand.id}
            type="ENTREGA"
            attachments={deliveryAttachments}
            variant="carousel"
          />
          <Comments demandId={demand.id} comments={comments} />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded border border-border bg-surface p-4">
            {/* key força o painel a refletir a verdade do servidor após
                qualquer revalidação (ex: o botão "Enviar para aprovação"
                muda o status por fora dos selects). */}
            <InlineFields
              key={`${detail.status}-${detail.assigneeId}-${detail.priority}-${detail.clientId}-${detail.dueDate}-${detail.publishDate}`}
              demand={detail}
              clients={clientOptions}
              users={userOptions}
            />
          </div>
          <ApprovalButton
            demandId={demand.id}
            disabled={demand.status === "APROVACAO"}
          />
        </aside>
      </div>
    </div>
  );
}
