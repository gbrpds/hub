import { prisma } from "@/lib/prisma";
import type { ClientOption, UserOption } from "@/lib/demand-meta";
import type {
  DetailDemand,
  SubtaskItem,
  CommentItem,
  AttachmentItem,
} from "./types";

export type DemandDetailData = {
  detail: DetailDemand;
  contentType: DetailDemand["contentType"];
  createdAt: string;
  subtasks: SubtaskItem[];
  comments: CommentItem[];
  clientAttachments: AttachmentItem[];
  deliveryAttachments: AttachmentItem[];
  clients: ClientOption[];
  users: UserOption[];
};

// Carrega os dados do detalhe da demanda. Usado tanto pela página inteira
// (deep link / refresh) quanto pelo modal interceptado — sem duplicar a query.
export async function loadDemandDetail(
  id: string,
): Promise<DemandDetailData | null> {
  const [demand, clients, users] = await Promise.all([
    prisma.demand.findUnique({
      where: { id },
      include: {
        subtasks: { orderBy: { createdAt: "asc" } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true, email: true } } },
        },
        attachments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, url: true, fileName: true, type: true },
        },
      },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!demand) return null;

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

  return {
    detail,
    contentType: demand.contentType,
    createdAt: demand.createdAt.toISOString(),
    subtasks,
    comments,
    clientAttachments: attachments.filter((a) => a.type === "CLIENTE"),
    deliveryAttachments: attachments.filter((a) => a.type === "ENTREGA"),
    clients,
    users,
  };
}
