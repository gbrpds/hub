import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { isAgentConfigured } from "@/lib/ai";
import { ChatView, type ChatMessage } from "./ChatView";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const ownerId = await getCurrentAdminId();
  if (!ownerId) notFound();

  const chat = await prisma.contentChat.findFirst({
    where: { id: chatId, ownerId },
    select: {
      id: true,
      title: true,
      client: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true },
      },
    },
  });

  if (!chat) notFound();

  const messages: ChatMessage[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <Link
            href="/admin/estudio"
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            ← Estúdio
          </Link>
          <h1 className="truncate text-lg font-bold text-foreground">
            {chat.title}
          </h1>
          <span className="text-xs text-muted">
            {chat.client?.name ?? "Brainstorm geral"}
          </span>
        </div>
      </div>

      <ChatView
        chatId={chat.id}
        initialMessages={messages}
        configured={isAgentConfigured()}
      />
    </div>
  );
}
