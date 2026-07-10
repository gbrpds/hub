"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { addSubtask, toggleSubtask, deleteSubtask } from "../actions";
import type { SubtaskItem } from "./types";

export function Subtasks({
  demandId,
  subtasks,
}: {
  demandId: string;
  subtasks: SubtaskItem[];
}) {
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const done = subtasks.filter((subtask) => subtask.done).length;
  const total = subtasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  function submit() {
    const value = title.trim();
    if (!value) return;
    setTitle("");
    setAdding(false);
    startTransition(() => addSubtask(demandId, value));
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Subtarefas
        </h2>
        <span className="rounded-sm bg-surface-hover px-1.5 py-0.5 text-xs font-semibold text-muted">
          {total}
        </span>
      </div>

      {/* Progresso */}
      {total > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">
              {done} de {total} concluídas
            </span>
            <span className="font-semibold text-accent">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full rounded-full bg-gradient-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {subtasks.map((subtask) => (
          <li
            key={subtask.id}
            className="group flex items-center gap-2.5 rounded-sm border border-border bg-surface px-2.5 py-2 transition-colors hover:border-border-strong"
          >
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => toggleSubtask(subtask.id, !subtask.done))
              }
              aria-label={subtask.done ? "Desmarcar" : "Concluir"}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                subtask.done
                  ? "border-success bg-success/20 text-success"
                  : "border-border-strong text-transparent hover:border-accent",
              )}
            >
              <CheckIcon width={13} height={13} />
            </button>
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm text-foreground",
                subtask.done && "text-muted line-through",
              )}
            >
              {subtask.title}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => deleteSubtask(subtask.id))}
              aria-label="Excluir subtarefa"
              className="shrink-0 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          action={submit}
          className="mt-2 flex items-end gap-2"
        >
          <div className="flex-1">
            <Input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => {
                if (!title.trim()) setAdding(false);
              }}
              placeholder="Nova subtarefa"
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            Adicionar
          </Button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-border py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <PlusIcon width={15} height={15} />
          Adicionar subtarefa
        </button>
      )}
    </section>
  );
}
