"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { approveDemand, requestChanges } from "@/app/portal/actions";

export function ApprovalPanel({ demandId }: { demandId: string }) {
  const [mode, setMode] = useState<"idle" | "changes">("idle");
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded border border-accent bg-surface p-4">
      <h2 className="text-sm font-bold tracking-tight text-foreground">
        O que você achou?
      </h2>
      <p className="mt-1 text-sm text-muted">
        Se estiver tudo certo, é só aprovar. Se quiser mudar algo, conte pra gente.
      </p>

      {mode === "idle" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={isPending}
            onClick={() => startTransition(() => approveDemand(demandId))}
          >
            Aprovar
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={isPending}
            onClick={() => setMode("changes")}
          >
            Solicitar ajuste
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            placeholder="Conte o que você gostaria de mudar..."
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending || !text.trim()}
              onClick={() =>
                startTransition(() => requestChanges(demandId, text))
              }
            >
              Enviar ajuste
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setMode("idle");
                setText("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
