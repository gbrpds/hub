"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { Task } from "@/app/generated/prisma/client";
import { createTask, deleteTask, toggleTask, updateTask } from "./actions";

const PRIORITY_OPTIONS = ["URGENTE", "ALTA", "MEDIA", "BAIXA"] as const;

const PRIORITY_BADGE: Record<string, "danger" | "accent" | "default" | "outline"> = {
  URGENTE: "danger",
  ALTA: "accent",
  MEDIA: "default",
  BAIXA: "outline",
};

const selectClassName =
  "h-10 rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function TodoClient({ tasks }: { tasks: Task[] }) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleTasks = hideCompleted ? tasks.filter((task) => !task.done) : tasks;

  return (
    <div className="flex flex-col gap-6">
      <form
        action={async (formData) => {
          await createTask(formData);
        }}
        className="flex flex-wrap items-end gap-3 border border-border bg-surface p-4"
      >
        <div className="min-w-[200px] flex-1">
          <Input name="title" label="Nova tarefa" placeholder="O que precisa ser feito?" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="new-dueDate">
            Prazo
          </label>
          <input id="new-dueDate" name="dueDate" type="date" className={selectClassName} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="new-priority">
            Prioridade
          </label>
          <select id="new-priority" name="priority" defaultValue="MEDIA" className={selectClassName}>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Adicionar</Button>
      </form>

      <label className="flex w-fit items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={(event) => setHideCompleted(event.target.checked)}
          className="h-4 w-4 border border-border bg-surface accent-accent"
        />
        Ocultar concluídas
      </label>

      {visibleTasks.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma tarefa por aqui.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleTasks.map((task) =>
            editingId === task.id ? (
              <li key={task.id} className="border border-border bg-surface p-4">
                <form
                  action={async (formData) => {
                    await updateTask(task.id, formData);
                    setEditingId(null);
                  }}
                  className="flex flex-wrap items-end gap-3"
                >
                  <div className="min-w-[200px] flex-1">
                    <Input name="title" label="Título" defaultValue={task.title} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor={`dueDate-${task.id}`}>
                      Prazo
                    </label>
                    <input
                      id={`dueDate-${task.id}`}
                      name="dueDate"
                      type="date"
                      defaultValue={toDateInputValue(task.dueDate)}
                      className={selectClassName}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor={`priority-${task.id}`}>
                      Prioridade
                    </label>
                    <select
                      id={`priority-${task.id}`}
                      name="priority"
                      defaultValue={task.priority}
                      className={selectClassName}
                    >
                      {PRIORITY_OPTIONS.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="sm">
                    Salvar
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </form>
              </li>
            ) : (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 border border-border bg-surface px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.done}
                    disabled={isPending}
                    onChange={(event) => {
                      const done = event.target.checked;
                      startTransition(() => {
                        toggleTask(task.id, done);
                      });
                    }}
                    className="h-4 w-4 shrink-0 border border-border bg-surface accent-accent"
                  />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate text-sm text-foreground",
                        task.done && "text-muted line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted">Prazo: {formatDate(task.dueDate)}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(task.id)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Excluir esta tarefa?")) {
                        startTransition(() => {
                          deleteTask(task.id);
                        });
                      }
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
