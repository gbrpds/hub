"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import {
  STATUS_ORDER,
  STATUS_META,
  CONTENT_TYPE_LABEL,
  type DemandCard,
} from "@/lib/demand-meta";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Avatar, PriorityTag } from "./parts";

// Lista estilo ClickUp: demandas agrupadas por status, cada grupo com um
// cabeçalho que expande/recolhe. A linha inteira abre o detalhe (popup).
export function ListView({ demands }: { demands: DemandCard[] }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(status: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  const groups = STATUS_ORDER.map((status) => ({
    status,
    meta: STATUS_META[status],
    items: demands.filter((demand) => demand.status === status),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return <p className="text-sm text-muted">Nenhuma demanda encontrada.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ status, meta, items }) => {
        const isCollapsed = collapsed.has(status);
        return (
          <div
            key={status}
            className="overflow-hidden rounded border border-border"
          >
            <button
              type="button"
              onClick={() => toggle(status)}
              className="flex w-full items-center gap-2 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
            >
              <ChevronDownIcon
                width={16}
                height={16}
                className={cn(
                  "shrink-0 text-muted transition-transform duration-200",
                  isCollapsed && "-rotate-90",
                )}
              />
              <span
                className="h-2.5 w-2.5 rounded-[1px]"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-sm font-bold text-foreground">
                {meta.label}
              </span>
              <span className="rounded-sm bg-surface-hover px-1.5 py-0.5 text-xs font-semibold text-muted">
                {items.length}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  {items.map((demand) => (
                    <div
                      key={demand.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        router.push(`/admin/demandas/${demand.id}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/admin/demandas/${demand.id}`);
                        }
                      }}
                      className="flex cursor-pointer items-center gap-3 border-t border-border px-3 py-3 transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {demand.title}
                        </span>
                        {demand.contentType && (
                          <span className="text-[11px] uppercase tracking-wide text-muted">
                            {CONTENT_TYPE_LABEL[demand.contentType]}
                          </span>
                        )}
                      </div>

                      <span className="hidden min-w-0 items-center gap-1.5 text-xs text-muted sm:flex sm:w-40">
                        {demand.client ? (
                          <>
                            <Avatar
                              name={demand.client.name}
                              photoUrl={demand.client.photoUrl}
                              size={20}
                            />
                            <span className="truncate">
                              {demand.client.name}
                            </span>
                          </>
                        ) : (
                          "Interno"
                        )}
                      </span>

                      <span className="hidden w-24 shrink-0 md:block">
                        <PriorityTag priority={demand.priority} />
                      </span>

                      <span className="w-20 shrink-0 text-right text-xs text-muted">
                        {demand.dueDate
                          ? formatDate(new Date(demand.dueDate))
                          : "—"}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
