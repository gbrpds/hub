"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CLIENT_STATUS_META } from "@/lib/demand-meta";
import type { DemandStatus } from "@/app/generated/prisma/client";

export type PortalDemandCard = {
  id: string;
  title: string;
  status: DemandStatus;
  hasDelivery: boolean;
};

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "APROVACAO", label: "Aguardando aprovação" },
  { key: "CONCLUIDO", label: "Concluídas" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function StatusPill({ status }: { status: DemandStatus }) {
  const meta = CLIENT_STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground">
      <span
        className="h-2 w-2 rounded-[1px]"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function DemandasGrid({ demands }: { demands: PortalDemandCard[] }) {
  const [filter, setFilter] = useState<FilterKey>("todas");

  const visible = useMemo(() => {
    if (filter === "todas") return demands;
    return demands.filter((demand) => demand.status === filter);
  }, [demands, filter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={cn(
              "rounded-sm border px-3 py-1.5 text-sm font-semibold transition-colors",
              filter === option.key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted">Nada por aqui ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((demand) => (
            <Link
              key={demand.id}
              href={`/portal/demandas/${demand.id}`}
              className="flex flex-col overflow-hidden rounded border border-border bg-surface transition-colors hover:border-accent"
            >
              <div className="relative flex h-40 items-center justify-center bg-background">
                <span className="text-xs text-muted">
                  {demand.hasDelivery ? "Entrega disponível — toque para ver" : "Em andamento"}
                </span>
                <div className="absolute left-2 top-2">
                  <StatusPill status={demand.status} />
                </div>
              </div>
              <div className="p-3">
                <p className="truncate font-medium text-foreground">
                  {demand.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
