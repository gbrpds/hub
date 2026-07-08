"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentAdminId } from "@/lib/current-user";
import { logActivity } from "@/lib/activity";
import { STATUS_META } from "@/lib/demand-meta";
import type { DemandStatus, AttachmentType } from "@/app/generated/prisma/client";

const STATUSES = [
  "RECEBIDA",
  "EM_PRODUCAO",
  "APROVACAO",
  "PROGRAMAR",
  "CONCLUIDO",
  "REPROVADO",
  "INTERNO",
] as const;
const PRIORITIES = ["URGENTE", "ALTA", "MEDIA", "BAIXA"] as const;
const CONTENT_TYPES = ["POST", "CARROSSEL", "REELS", "STORY", "VIDEO_LONGO"] as const;
const ATTACHMENT_TYPES = ["CLIENTE", "ENTREGA"] as const;

function parseEnum<T extends string>(
  value: FormDataEntryValue | string | null,
  allowed: readonly T[],
  fallback: T | null,
): T | null {
  const raw = String(value ?? "");
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function parseDate(value: FormDataEntryValue | string | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Revalida a lista, qualquer página de detalhe e o dashboard (feed).
function revalidateDemands() {
  revalidatePath("/admin/demandas");
  revalidatePath("/admin/demandas/[id]", "page");
  revalidatePath("/admin/dashboard");
}

export async function createDemand(formData: FormData) {
  if (!(await canActAsAdmin())) return { ok: false as const, error: "Sem permissão." };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false as const, error: "Dê um título para a demanda." };

  await prisma.demand.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      priority: parseEnum(formData.get("priority"), PRIORITIES, "MEDIA")!,
      contentType: parseEnum(formData.get("contentType"), CONTENT_TYPES, null),
      clientId: String(formData.get("clientId") ?? "").trim() || null,
      dueDate: parseDate(formData.get("dueDate")),
      publishDate: parseDate(formData.get("publishDate")),
    },
  });

  revalidateDemands();
  return { ok: true as const };
}

export async function updateDemandStatus(id: string, status: string) {
  if (!(await canActAsAdmin())) return;
  const parsed = parseEnum<DemandStatus>(status, STATUSES, null);
  if (!parsed) return;

  const demand = await prisma.demand.update({
    where: { id },
    data: { status: parsed },
    select: { title: true },
  });

  await logActivity(
    `Demanda "${demand.title}" mudou para ${STATUS_META[parsed].label}`,
    "DEMAND_STATUS_CHANGED",
  );
  revalidateDemands();
}

export async function sendToApproval(id: string) {
  if (!(await canActAsAdmin())) return;
  await updateDemandStatus(id, "APROVACAO");
}

export async function updateDemandField(
  id: string,
  field: string,
  value: string,
) {
  if (!(await canActAsAdmin())) return;
  const data: Record<string, unknown> = {};

  switch (field) {
    case "priority": {
      const parsed = parseEnum(value, PRIORITIES, null);
      if (!parsed) return;
      data.priority = parsed;
      break;
    }
    case "contentType":
      data.contentType = parseEnum(value, CONTENT_TYPES, null);
      break;
    case "assigneeId":
      data.assigneeId = value || null;
      break;
    case "clientId":
      data.clientId = value || null;
      break;
    case "dueDate":
      data.dueDate = parseDate(value);
      break;
    case "publishDate":
      data.publishDate = parseDate(value);
      break;
    case "description":
      data.description = value.trim() || null;
      break;
    case "caption":
      data.caption = value.trim() || null;
      break;
    default:
      return;
  }

  await prisma.demand.update({ where: { id }, data });
  revalidateDemands();
}

export async function addSubtask(demandId: string, title: string) {
  if (!(await canActAsAdmin())) return;
  const trimmed = title.trim();
  if (!trimmed) return;
  await prisma.subtask.create({ data: { title: trimmed, demandId } });
  revalidateDemands();
}

export async function toggleSubtask(id: string, done: boolean) {
  if (!(await canActAsAdmin())) return;
  await prisma.subtask.update({ where: { id }, data: { done } });
  revalidateDemands();
}

export async function deleteSubtask(id: string) {
  if (!(await canActAsAdmin())) return;
  await prisma.subtask.delete({ where: { id } });
  revalidateDemands();
}

export async function addComment(demandId: string, text: string) {
  if (!(await canActAsAdmin())) return;
  const trimmed = text.trim();
  if (!trimmed) return;

  const authorId = await getCurrentAdminId();
  if (!authorId) return;

  await prisma.comment.create({ data: { text: trimmed, authorId, demandId } });

  const demand = await prisma.demand.findUnique({
    where: { id: demandId },
    select: { title: true },
  });
  await logActivity(
    `Novo comentário em "${demand?.title ?? "demanda"}"`,
    "DEMAND_COMMENT",
  );
  revalidateDemands();
}

export async function addAttachment(
  demandId: string,
  type: string,
  url: string,
  fileName: string,
) {
  if (!(await canActAsAdmin())) return;
  const parsedType = parseEnum<AttachmentType>(type, ATTACHMENT_TYPES, null);
  if (!parsedType || !url) return;

  await prisma.attachment.create({
    data: { demandId, type: parsedType, url, fileName: fileName || null },
  });

  const demand = await prisma.demand.findUnique({
    where: { id: demandId },
    select: { title: true },
  });
  const label = parsedType === "CLIENTE" ? "do cliente" : "de entrega";
  await logActivity(
    `Novo anexo ${label} em "${demand?.title ?? "demanda"}"`,
    "DEMAND_ATTACHMENT",
  );
  revalidateDemands();
}

export async function deleteAttachment(id: string) {
  if (!(await canActAsAdmin())) return;
  await prisma.attachment.delete({ where: { id } });
  revalidateDemands();
}
