"use client";

import { useState } from "react";
import { SparklesIcon } from "@/components/ui/icons";
import { createChat } from "./actions";

// Lançador de nova conversa: escolhe o cliente (ou brainstorm geral) e cria
// o chat. O submit é uma server action que redireciona pra conversa nova.
export function NewChatForm({
  clients,
}: {
  clients: { id: string; name: string }[];
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={createChat}
      onSubmit={() => setPending(true)}
      className="flex flex-col gap-3 rounded border border-border bg-surface p-4 sm:flex-row sm:items-center"
    >
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Cliente
        </span>
        <select
          name="clientId"
          defaultValue=""
          className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">Brainstorm geral (sem cliente)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 self-end rounded-sm bg-gradient-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)] transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        <SparklesIcon width={16} height={16} />
        {pending ? "Criando…" : "Nova conversa"}
      </button>
    </form>
  );
}
