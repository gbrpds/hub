"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  const [isPending, startTransition] = useTransition();

  const done = subtasks.filter((subtask) => subtask.done).length;

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold tracking-tight text-foreground">
        Subtarefas{" "}
        <span className="text-muted">
          ({done}/{subtasks.length})
        </span>
      </h2>

      <ul className="flex flex-col gap-1">
        {subtasks.map((subtask) => (
          <li
            key={subtask.id}
            className="flex items-center justify-between gap-3 border border-border bg-surface px-3 py-2"
          >
            <label className="flex min-w-0 items-center gap-2">
              <input
                type="checkbox"
                checked={subtask.done}
                disabled={isPending}
                onChange={(event) =>
                  startTransition(() =>
                    toggleSubtask(subtask.id, event.target.checked),
                  )
                }
                className="h-4 w-4 shrink-0 border border-border bg-surface accent-accent"
              />
              <span
                className={cn(
                  "truncate text-sm text-foreground",
                  subtask.done && "text-muted line-through",
                )}
              >
                {subtask.title}
              </span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTransition(() => deleteSubtask(subtask.id))}
            >
              Excluir
            </Button>
          </li>
        ))}
      </ul>

      <form
        action={() => {
          const value = title.trim();
          if (!value) return;
          setTitle("");
          startTransition(() => addSubtask(demandId, value));
        }}
        className="mt-3 flex items-end gap-2"
      >
        <div className="flex-1">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nova subtarefa"
          />
        </div>
        <Button type="submit" size="sm">
          Adicionar
        </Button>
      </form>
    </section>
  );
}
