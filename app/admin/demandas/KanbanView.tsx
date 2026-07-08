"use client";

import { useState } from "react";
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

  return (
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
              {columnDemands.map((demand) => (
                <article
                  key={demand.id}
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", demand.id)
                  }
                  className="cursor-grab rounded-sm border border-border bg-background p-3 active:cursor-grabbing"
                >
                  <p className="text-sm font-medium text-foreground">
                    {demand.title}
                  </p>

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
                </article>
              ))}

              {columnDemands.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
