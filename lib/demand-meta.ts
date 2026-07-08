import type {
  DemandStatus,
  Priority,
  ContentType,
} from "@/app/generated/prisma/client";

export const STATUS_ORDER: DemandStatus[] = [
  "RECEBIDA",
  "EM_PRODUCAO",
  "APROVACAO",
  "PROGRAMAR",
  "CONCLUIDO",
  "REPROVADO",
  "INTERNO",
];

export const STATUS_META: Record<DemandStatus, { label: string; color: string }> = {
  RECEBIDA: { label: "Recebida", color: "#3b82f6" },
  EM_PRODUCAO: { label: "Em produção", color: "#ff5c00" },
  APROVACAO: { label: "Aprovação", color: "#eab308" },
  PROGRAMAR: { label: "Programar", color: "#a855f7" },
  CONCLUIDO: { label: "Concluído", color: "#22c55e" },
  REPROVADO: { label: "Reprovado", color: "#ef4444" },
  INTERNO: { label: "Interno", color: "#737373" },
};

export const PRIORITY_ORDER: Priority[] = ["URGENTE", "ALTA", "MEDIA", "BAIXA"];

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  URGENTE: { label: "Urgente", color: "#ef4444" },
  ALTA: { label: "Alta", color: "#ff5c00" },
  MEDIA: { label: "Média", color: "#eab308" },
  BAIXA: { label: "Baixa", color: "#737373" },
};

export const CONTENT_TYPE_ORDER: ContentType[] = [
  "POST",
  "CARROSSEL",
  "REELS",
  "STORY",
  "VIDEO_LONGO",
];

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  POST: "Post",
  CARROSSEL: "Carrossel",
  REELS: "Reels",
  STORY: "Story",
  VIDEO_LONGO: "Vídeo longo",
};

// Shapes serializáveis passados do Server Component para os Client
// Components (datas viram ISO string ao cruzar a fronteira RSC).
export type DemandCard = {
  id: string;
  title: string;
  description: string | null;
  status: DemandStatus;
  priority: Priority;
  contentType: ContentType | null;
  dueDate: string | null;
  publishDate: string | null;
  client: { id: string; name: string; photoUrl: string | null } | null;
  assignee: { id: string; name: string | null; email: string } | null;
};

export type ClientOption = { id: string; name: string; photoUrl: string | null };
export type UserOption = { id: string; name: string | null; email: string };
