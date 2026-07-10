import type { Priority } from "@/app/generated/prisma/client";

// Mapeia a prioridade interna para o estilo Todoist (P1–P4).
export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; name: string }
> = {
  URGENTE: { label: "P1", color: "#ef4444", name: "Urgente" },
  ALTA: { label: "P2", color: "#ff7a3d", name: "Alta" },
  MEDIA: { label: "P3", color: "#3b82f6", name: "Média" },
  BAIXA: { label: "P4", color: "#8a8a8a", name: "Baixa" },
};

export const PRIORITY_ORDER: Priority[] = ["URGENTE", "ALTA", "MEDIA", "BAIXA"];

export type TodoTask = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  dueDate: string | null;
  priority: Priority;
  subtasks: {
    id: string;
    title: string;
    done: boolean;
  }[];
};
