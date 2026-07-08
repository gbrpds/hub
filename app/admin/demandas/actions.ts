"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { DemandStatus } from "@/app/generated/prisma/client";

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

function parseEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[],
  fallback: T | null,
): T | null {
  const raw = String(value ?? "");
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createDemand(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

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

  revalidatePath("/admin/demandas");
}

export async function updateDemandStatus(id: string, status: string) {
  const parsed = parseEnum<DemandStatus>(status, STATUSES, null);
  if (!parsed) return;

  await prisma.demand.update({ where: { id }, data: { status: parsed } });
  revalidatePath("/admin/demandas");
}
