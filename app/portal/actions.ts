"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getCurrentClientId,
  getCurrentClientUserId,
} from "@/lib/current-user";
import { logActivity } from "@/lib/activity";

const PRIORITIES = ["URGENTE", "ALTA", "MEDIA", "BAIXA"] as const;
const CONTENT_TYPES = ["POST", "CARROSSEL", "REELS", "STORY", "VIDEO_LONGO"] as const;

function parseEnum<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T | null,
): T | null {
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function parseDate(value: string): Date | null {
  const raw = value.trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function revalidateAll() {
  revalidatePath("/portal");
  revalidatePath("/portal/demandas");
  revalidatePath("/portal/demandas/[id]", "page");
  revalidatePath("/portal/cronograma");
  revalidatePath("/admin/demandas");
  revalidatePath("/admin/dashboard");
}

export type NewDemandInput = {
  title: string;
  details: string;
  contentType: string;
  publishDate: string;
  priority: string;
  attachments: { name: string; url: string }[];
};

export async function createClientDemand(input: NewDemandInput) {
  const clientId = await getCurrentClientId();
  if (!clientId) return { ok: false as const };

  const title = input.title.trim();
  if (!title) return { ok: false as const };

  const demand = await prisma.demand.create({
    data: {
      title,
      description: input.details.trim() || null,
      status: "RECEBIDA",
      priority: parseEnum(input.priority, PRIORITIES, "MEDIA")!,
      contentType: parseEnum(input.contentType, CONTENT_TYPES, null),
      clientId,
      publishDate: parseDate(input.publishDate),
      attachments: {
        create: input.attachments
          .filter((file) => file.url)
          .map((file) => ({
            url: file.url,
            fileName: file.name || null,
            type: "CLIENTE" as const,
          })),
      },
    },
    select: { id: true },
  });

  await logActivity(`Novo pedido do cliente: "${title}"`, "CLIENT_DEMAND_CREATED");
  revalidateAll();
  return { ok: true as const, id: demand.id };
}

export async function approveDemand(demandId: string) {
  const clientId = await getCurrentClientId();
  if (!clientId) return;

  // Só permite agir sobre demanda do próprio cliente e que está em aprovação.
  const demand = await prisma.demand.findFirst({
    where: { id: demandId, clientId, status: "APROVACAO" },
    select: { publishDate: true, title: true },
  });
  if (!demand) return;

  const newStatus = demand.publishDate ? "PROGRAMAR" : "CONCLUIDO";
  await prisma.demand.update({
    where: { id: demandId },
    data: { status: newStatus },
  });

  await logActivity(`Cliente aprovou "${demand.title}"`, "CLIENT_APPROVED");
  revalidateAll();
}

export async function requestChanges(demandId: string, text: string) {
  const clientId = await getCurrentClientId();
  if (!clientId) return;

  const demand = await prisma.demand.findFirst({
    where: { id: demandId, clientId, status: "APROVACAO" },
    select: { title: true },
  });
  if (!demand) return;

  await prisma.demand.update({
    where: { id: demandId },
    data: { status: "REPROVADO" },
  });

  const trimmed = text.trim();
  const authorId = await getCurrentClientUserId();
  if (trimmed && authorId) {
    await prisma.comment.create({
      data: { text: trimmed, authorId, demandId },
    });
  }

  await logActivity(
    `Cliente pediu ajustes em "${demand.title}"`,
    "CLIENT_REQUESTED_CHANGES",
  );
  revalidateAll();
}
