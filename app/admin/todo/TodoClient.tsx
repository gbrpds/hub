"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { CheckIcon, FlagIcon, PlusIcon } from "@/components/ui/icons";
import { PRIORITY_META, PRIORITY_ORDER, type TodoTask } from "./todo-meta";
import {
  quickAddTask,
  addSubtask,
  updateTaskField,
  toggleTask,
  deleteTask,
} from "./actions";
import type { Priority } from "@/app/generated/prisma/client";

function TaskCheckbox({
  done,
  color,
  onToggle,
  size = 20,
}: {
  done: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={done ? "Reabrir" : "Concluir"}
      className="group/cb flex shrink-0 items-center justify-center rounded-full border-2 transition-colors"
      style={{
        width: size,
        height: size,
        borderColor: color,
        backgroundColor: done ? color : "transparent",
      }}
    >
      <CheckIcon
        width={size * 0.6}
        height={size * 0.6}
        className={cn(
          "transition-opacity",
          done ? "opacity-100" : "opacity-0 group-hover/cb:opacity-50",
        )}
        style={{ color: done ? "#fff" : color }}
      />
    </button>
  );
}

export function TodoClient({ tasks }: { tasks: TodoTask[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [, startTransition] = useTransition();

  // Deriva a tarefa aberta; se ela some (excluída), o modal fecha sozinho.
  const open = tasks.find((t) => t.id === openId) ?? null;

  function submitNew() {
    const title = newTitle.trim();
    if (!title) {
      setAdding(false);
      return;
    }
    setNewTitle("");
    startTransition(() => quickAddTask({ title }));
  }

  return (
    <div className="max-w-2xl">
      <ul className="flex flex-col">
        {tasks.map((task) => {
          const meta = PRIORITY_META[task.priority];
          const doneSub = task.subtasks.filter((s) => s.done).length;
          return (
            <li
              key={task.id}
              className="group flex items-start gap-3 border-b border-border py-3 first:border-t"
            >
              <div className="pt-0.5">
                <TaskCheckbox
                  done={task.done}
                  color={meta.color}
                  onToggle={() =>
                    startTransition(() => toggleTask(task.id, !task.done))
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => setOpenId(task.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span
                  className={cn(
                    "text-sm text-foreground",
                    task.done && "text-muted line-through",
                  )}
                >
                  {task.title}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {task.dueDate && (
                    <span>{formatDate(new Date(task.dueDate))}</span>
                  )}
                  {task.subtasks.length > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckIcon width={11} height={11} />
                      {doneSub}/{task.subtasks.length}
                    </span>
                  )}
                </div>
              </button>
              {task.priority !== "BAIXA" && (
                <FlagIcon
                  width={15}
                  height={15}
                  className="mt-0.5 shrink-0"
                  style={{ color: meta.color }}
                />
              )}
              <button
                type="button"
                onClick={() => startTransition(() => deleteTask(task.id))}
                aria-label="Excluir"
                className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      {/* Adicionar tarefa (inline, estilo Todoist) */}
      {adding ? (
        <form
          action={submitNew}
          className="mt-3 flex flex-col gap-2 rounded border border-border bg-surface p-3"
        >
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Nome da tarefa"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewTitle("");
              }}
              className="rounded-sm px-3 py-1.5 text-sm text-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-sm bg-gradient-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"
            >
              Adicionar tarefa
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-2 py-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-accent">
            <PlusIcon width={16} height={16} />
          </span>
          Adicionar tarefa
        </button>
      )}

      <AnimatePresence>
        {open && (
          <TaskDetail
            key={open.id}
            task={open}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskDetail({ task, onClose }: { task: TodoTask; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [subInput, setSubInput] = useState("");
  const [, startTransition] = useTransition();
  const meta = PRIORITY_META[task.priority];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded border border-border-strong bg-background shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-xs uppercase tracking-wide text-muted">
            Tarefa
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,1fr)_260px]">
          {/* Conteúdo */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-3">
              <div className="pt-1">
                <TaskCheckbox
                  done={task.done}
                  color={meta.color}
                  size={22}
                  onToggle={() =>
                    startTransition(() => toggleTask(task.id, !task.done))
                  }
                />
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== task.title)
                    startTransition(() =>
                      updateTaskField(task.id, "title", title),
                    );
                }}
                className={cn(
                  "w-full bg-transparent text-lg font-bold tracking-tight text-foreground focus:outline-none",
                  task.done && "text-muted line-through",
                )}
              />
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== (task.description ?? ""))
                  startTransition(() =>
                    updateTaskField(task.id, "description", description),
                  );
              }}
              rows={3}
              placeholder="Descrição"
              className="ml-9 w-[calc(100%-2.25rem)] resize-none rounded-sm bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />

            {/* Subtarefas */}
            <div className="ml-9 flex flex-col gap-1">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="group/sub flex items-center gap-2.5 py-1">
                  <TaskCheckbox
                    done={sub.done}
                    color="#8a8a8a"
                    size={18}
                    onToggle={() =>
                      startTransition(() => toggleTask(sub.id, !sub.done))
                    }
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm text-foreground",
                      sub.done && "text-muted line-through",
                    )}
                  >
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => startTransition(() => deleteTask(sub.id))}
                    className="text-muted opacity-0 transition-opacity hover:text-danger group-hover/sub:opacity-100"
                    aria-label="Excluir subtarefa"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <form
                action={() => {
                  const v = subInput.trim();
                  if (!v) return;
                  setSubInput("");
                  startTransition(() => addSubtask(task.id, v));
                }}
                className="flex items-center gap-2 py-1"
              >
                <PlusIcon width={16} height={16} className="text-accent" />
                <input
                  value={subInput}
                  onChange={(e) => setSubInput(e.target.value)}
                  placeholder="Adicionar subtarefa"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
              </form>
            </div>
          </div>

          {/* Sidebar: Data + Prioridade */}
          <div className="flex flex-col gap-5 border-t border-border p-5 md:border-l md:border-t-0">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Data
              </span>
              <input
                type="date"
                defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                onChange={(e) =>
                  startTransition(() =>
                    updateTaskField(task.id, "dueDate", e.target.value),
                  )
                }
                className="w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Prioridade
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITY_ORDER.map((p) => {
                  const pm = PRIORITY_META[p as Priority];
                  const active = task.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        startTransition(() =>
                          updateTaskField(task.id, "priority", p),
                        )
                      }
                      title={pm.name}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-sm border py-1.5 text-[11px] font-semibold transition-colors",
                        active
                          ? "border-current"
                          : "border-border text-muted hover:border-border-strong",
                      )}
                      style={active ? { color: pm.color } : undefined}
                    >
                      <FlagIcon
                        width={14}
                        height={14}
                        style={{ color: pm.color }}
                      />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => startTransition(() => deleteTask(task.id))}
              className="mt-auto flex items-center gap-2 text-sm text-muted transition-colors hover:text-danger"
            >
              🗑 Excluir tarefa
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
