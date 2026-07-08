import type {
  DemandStatus,
  Priority,
  ContentType,
  AttachmentType,
} from "@/app/generated/prisma/client";

export type DetailDemand = {
  id: string;
  title: string;
  description: string | null;
  caption: string | null;
  status: DemandStatus;
  priority: Priority;
  contentType: ContentType | null;
  clientId: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  publishDate: string | null;
};

export type SubtaskItem = { id: string; title: string; done: boolean };

export type CommentItem = {
  id: string;
  text: string;
  createdAt: string;
  author: { name: string | null; email: string } | null;
};

export type AttachmentItem = {
  id: string;
  url: string;
  fileName: string | null;
  type: AttachmentType;
};
