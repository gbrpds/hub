"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentAdminId } from "@/lib/current-user";

const PRIORITIES = ["URGENTE", "ALTA", "MEDIA", "BAIXA"] as const;
type PriorityValue = (typeof PRIORITIES)[number];

function parsePriority(value: FormDataEntryValue | null): PriorityValue {
  return (PRIORITIES as readonly string[]).includes(String(value))
    ? (value as PriorityValue)
    : "MEDIA";
}

function parseDueDate(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createTask(formData: FormData) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.task.create({
    data: {
      title,
      priority: parsePriority(formData.get("priority")),
      dueDate: parseDueDate(formData.get("dueDate")),
      ownerId,
    },
  });

  revalidatePath("/admin/todo");
}

export async function updateTask(id: string, formData: FormData) {
  if (!(await canActAsAdmin())) return;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.task.update({
    where: { id },
    data: {
      title,
      priority: parsePriority(formData.get("priority")),
      dueDate: parseDueDate(formData.get("dueDate")),
    },
  });

  revalidatePath("/admin/todo");
}

export async function toggleTask(id: string, done: boolean) {
  if (!(await canActAsAdmin())) return;
  await prisma.task.update({ where: { id }, data: { done } });
  revalidatePath("/admin/todo");
}

export async function deleteTask(id: string) {
  if (!(await canActAsAdmin())) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/admin/todo");
}
