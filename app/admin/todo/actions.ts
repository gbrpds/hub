"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canActAsAdmin } from "@/lib/guards";
import { getCurrentAdminId } from "@/lib/current-user";
import type { Priority } from "@/app/generated/prisma/client";

const PRIORITIES = ["URGENTE", "ALTA", "MEDIA", "BAIXA"] as const;

function parsePriority(value: string | null | undefined): Priority {
  return (PRIORITIES as readonly string[]).includes(String(value))
    ? (value as Priority)
    : "MEDIA";
}

function parseDueDate(value: string | null | undefined): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Criação rápida (Todoist): só o título (+ prioridade/prazo opcionais).
export async function quickAddTask(input: {
  title: string;
  priority?: string;
  dueDate?: string;
}) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;
  const title = input.title.trim();
  if (!title) return;

  await prisma.task.create({
    data: {
      title,
      priority: parsePriority(input.priority),
      dueDate: parseDueDate(input.dueDate),
      ownerId,
    },
  });
  revalidatePath("/admin/todo");
}

export async function addSubtask(parentId: string, title: string) {
  if (!(await canActAsAdmin())) return;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) return;
  const value = title.trim();
  if (!value) return;

  await prisma.task.create({
    data: { title: value, ownerId, parentId },
  });
  revalidatePath("/admin/todo");
}

// Atualização parcial de um campo (título, descrição, prioridade, prazo).
export async function updateTaskField(
  id: string,
  field: "title" | "description" | "priority" | "dueDate",
  value: string,
) {
  if (!(await canActAsAdmin())) return;
  const data: Record<string, unknown> = {};
  switch (field) {
    case "title":
      if (!value.trim()) return;
      data.title = value.trim();
      break;
    case "description":
      data.description = value.trim() || null;
      break;
    case "priority":
      data.priority = parsePriority(value);
      break;
    case "dueDate":
      data.dueDate = parseDueDate(value);
      break;
  }
  await prisma.task.update({ where: { id }, data });
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
