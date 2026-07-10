"use client";

import { useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import {
  STATUS_ORDER,
  STATUS_META,
  CONTENT_TYPE_LABEL,
  type DemandCard,
} from "@/lib/demand-meta";
import type { DemandStatus } from "@/app/generated/prisma/client";
import { Avatar, PriorityTag } from "./parts";

export function KanbanView({
  demands,
  onMove,
}: {
  demands: DemandCard[];
  onMove: (id: string, status: DemandStatus) => void;
}) {
  const [dragOver, setDragOver] = useState<DemandStatus | null>(null);
  const router = useRouter();

  return (
    <LayoutGroup>
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const columnDemands = demands.filter((demand) => demand.status === status);

        return (
          <div
            key={status}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded border border-border bg-surface",
              dragOver === status && "border-accent",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() =>
              setDragOver((current) => (current === status ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault();
              const id = event.dataTransfer.getData("text/plain");
              setDragOver(null);
              if (id) onMove(id, status);
            }}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-[1px]"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </span>
              <span className="text-xs text-muted">{columnDemands.length}</span>
            </div>

            <div className="flex min-h-[80px] flex-col gap-2 p-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {columnDemands.map((demand) => (
                  <motion.article
                    key={demand.id}
                    layout
                    layoutId={`demand-${demand.id}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.18 },
                      scale: { duration: 0.18 },
                    }}
                    draggable
                    onDragStart={(event) =>
                      (
                        event as unknown as DragEvent
                      ).dataTransfer.setData("text/plain", demand.id)
                    }
                    onClick={() => router.push(`/admin/demandas/${demand.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/admin/demandas/${demand.id}`);
                      }
                    }}
                    className="cursor-pointer rounded-sm border border-border bg-background p-3 transition-colors hover:border-accent/50 active:cursor-grabbing"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {demand.title}
                    </span>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <PriorityTag priority={demand.priority} />
                      {demand.contentType && (
                        <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                          {CONTENT_TYPE_LABEL[demand.contentType]}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
                        {demand.client ? (
                          <>
                            <Avatar
                              name={demand.client.name}
                              photoUrl={demand.client.photoUrl}
                              size={18}
                            />
                            <span className="truncate">{demand.client.name}</span>
                          </>
                        ) : (
                          "Interno"
                        )}
                      </span>
                      {demand.dueDate && (
                        <span className="shrink-0 text-xs text-muted">
                          {formatDate(new Date(demand.dueDate))}
                        </span>
                      )}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              {columnDemands.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </LayoutGroup>
  );
}
