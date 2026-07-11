"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SparklesIcon, TrashIcon, PlusIcon, CheckIcon } from "@/components/ui/icons";
import { createDemandFromMessage, deleteChat } from "../actions";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type DemandState = "idle" | "loading" | "done" | "error";

export function ChatView({
  chatId,
  initialMessages,
  configured,
}: {
  chatId: string;
  initialMessages: ChatMessage[];
  configured: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [demandStates, setDemandStates] = useState<Record<string, DemandState>>({});
  const [demandErrors, setDemandErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rola pro fim a cada nova mensagem/atualização de stream.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/admin/content-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: text }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Falha na resposta.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
      // Sincroniza ids reais persistidos no servidor.
      router.refresh();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Erro.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || `⚠️ ${detail}` }
            : m,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  async function toDemand(msg: ChatMessage) {
    setDemandStates((s) => ({ ...s, [msg.id]: "loading" }));
    const result = await createDemandFromMessage(chatId, msg.content);
    setDemandStates((s) => ({
      ...s,
      [msg.id]: result.ok ? "done" : "error",
    }));
    if (result.ok) {
      router.refresh();
    } else {
      setDemandErrors((s) => ({ ...s, [msg.id]: result.error }));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-border bg-surface">
      {/* Histórico */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
            <SparklesIcon width={28} height={28} className="text-accent" />
            <p className="max-w-sm">
              Comece contando o que você quer criar. Jogue referências, links e
              ideias — o agente já conhece o contexto deste cliente.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const state = demandStates[msg.id] ?? "idle";
          // Esconde o botão enquanto esta mensagem ainda está sendo escrita.
          const streaming = sending && index === messages.length - 1;
          return (
            <div
              key={msg.id}
              className={isUser ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  isUser
                    ? "max-w-[85%] rounded-lg rounded-br-sm bg-gradient-accent px-4 py-2.5 text-sm text-accent-foreground"
                    : "max-w-[85%] rounded-lg rounded-bl-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content || (
                    <span className="inline-flex gap-1 text-muted">
                      <span className="glow-pulse">●</span> pensando…
                    </span>
                  )}
                </p>

                {!isUser && msg.content.trim() && !streaming && (
                  <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                    {state === "done" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <CheckIcon width={14} height={14} /> Demanda criada
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toDemand(msg)}
                        disabled={state === "loading"}
                        className="flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-foreground disabled:opacity-60"
                      >
                        <PlusIcon width={13} height={13} />
                        {state === "loading" ? "Criando…" : "Virar demanda"}
                      </button>
                    )}
                    {state === "error" && (
                      <span className="text-xs text-red-400">
                        {demandErrors[msg.id] ?? "Falhou, tente de novo"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de envio */}
      <div className="border-t border-border p-3">
        {!configured && (
          <p className="mb-2 text-xs text-yellow-200/80">
            Configure a GEMINI_API_KEY para conversar com o agente.
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Escreva pro agente… (Enter envia, Shift+Enter quebra linha)"
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !input.trim()}
            className="flex h-11 items-center gap-2 rounded-sm bg-gradient-accent px-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <SparklesIcon width={16} height={16} />
            {sending ? "…" : "Enviar"}
          </button>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (confirm("Excluir esta conversa?")) deleteChat(chatId);
            }}
            className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-red-400"
          >
            <TrashIcon width={13} height={13} /> Excluir conversa
          </button>
        </div>
      </div>
    </div>
  );
}
