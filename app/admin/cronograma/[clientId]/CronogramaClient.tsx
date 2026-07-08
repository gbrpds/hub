"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/demand-meta";
import type { DemandStatus } from "@/app/generated/prisma/client";

export type CalendarDemand = {
  id: string;
  title: string;
  status: DemandStatus;
  refKey: string | null; // YYYY-MM-DD
};

type GroupKey = "aprovados" | "aguardando" | "reprovados" | "afazer";

const GROUPS: {
  key: GroupKey;
  label: string;
  color: string;
  statuses: DemandStatus[];
}[] = [
  { key: "aprovados", label: "Aprovados", color: "#22c55e", statuses: ["CONCLUIDO"] },
  { key: "aguardando", label: "Aguardando aprovação", color: "#eab308", statuses: ["APROVACAO"] },
  { key: "reprovados", label: "Reprovados", color: "#ef4444", statuses: ["REPROVADO"] },
  {
    key: "afazer",
    label: "A fazer",
    color: "#ff5c00",
    statuses: ["RECEBIDA", "EM_PRODUCAO", "PROGRAMAR"],
  },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function groupOf(status: DemandStatus): GroupKey | null {
  return GROUPS.find((group) => group.statuses.includes(status))?.key ?? null;
}

export function CronogramaClient({ demands }: { demands: CalendarDemand[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [view, setView] = useState<"month" | "list">("month");
  const [filter, setFilter] = useState<GroupKey | null>(null);

  const monthPrefix = `${year}-${pad(month + 1)}`;

  // Demandas do mês visível (com data no mês).
  const monthDemands = useMemo(
    () => demands.filter((demand) => demand.refKey?.startsWith(monthPrefix)),
    [demands, monthPrefix],
  );

  const counts = useMemo(() => {
    const base: Record<GroupKey, number> = {
      aprovados: 0,
      aguardando: 0,
      reprovados: 0,
      afazer: 0,
    };
    for (const demand of monthDemands) {
      const key = groupOf(demand.status);
      if (key) base[key] += 1;
    }
    return base;
  }, [monthDemands]);

  const visible = useMemo(
    () =>
      filter
        ? monthDemands.filter((demand) => groupOf(demand.status) === filter)
        : monthDemands,
    [monthDemands, filter],
  );

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }
  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // Grade do calendário.
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarDemand[]>();
    for (const demand of visible) {
      if (!demand.refKey) continue;
      const list = map.get(demand.refKey) ?? [];
      list.push(demand);
      map.set(demand.refKey, list);
    }
    return map;
  }, [visible]);

  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Contadores filtráveis */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GROUPS.map((group) => (
          <button
            key={group.key}
            type="button"
            onClick={() => setFilter((f) => (f === group.key ? null : group.key))}
            className={cn(
              "flex flex-col items-start rounded border bg-surface p-3 text-left transition-colors",
              filter === group.key ? "border-accent" : "border-border hover:bg-surface-hover",
            )}
          >
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted">
              <span
                className="h-2 w-2 rounded-[1px]"
                style={{ backgroundColor: group.color }}
              />
              {group.label}
            </span>
            <span className="mt-1 text-2xl font-bold text-foreground">
              {counts[group.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de navegação */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-sm border border-border px-2 py-1 text-sm text-foreground hover:bg-surface"
          >
            ‹
          </button>
          <span className="min-w-[160px] text-center text-sm font-bold text-foreground">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded-sm border border-border px-2 py-1 text-sm text-foreground hover:bg-surface"
          >
            ›
          </button>
        </div>

        <div className="flex overflow-hidden rounded border border-border">
          {(["month", "list"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold transition-colors",
                view === value
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-muted hover:text-foreground",
              )}
            >
              {value === "month" ? "Mês" : "Lista"}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-7 gap-px border border-border bg-border">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="bg-surface px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {weekday}
              </div>
            ))}
            {cells.map((day, index) => {
              const key = day ? `${monthPrefix}-${pad(day)}` : null;
              const dayDemands = key ? byDay.get(key) ?? [] : [];
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[96px] bg-background p-1",
                    key === todayKey && "ring-1 ring-inset ring-accent",
                  )}
                >
                  {day && (
                    <>
                      <div className="mb-1 px-1 text-xs text-muted">{day}</div>
                      <div className="flex flex-col gap-1">
                        {dayDemands.map((demand) => (
                          <Link
                            key={demand.id}
                            href={`/admin/demandas/${demand.id}`}
                            className="flex items-center gap-1 rounded-sm border border-border bg-surface px-1.5 py-1 text-[11px] text-foreground hover:border-accent"
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-[1px]"
                              style={{
                                backgroundColor: STATUS_META[demand.status].color,
                              }}
                            />
                            <span className="truncate">{demand.title}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.length === 0 ? (
            <p className="text-sm text-muted">Nada neste mês.</p>
          ) : (
            [...visible]
              .sort((a, b) => (a.refKey ?? "").localeCompare(b.refKey ?? ""))
              .map((demand) => (
                <Link
                  key={demand.id}
                  href={`/admin/demandas/${demand.id}`}
                  className="flex items-center justify-between gap-3 border border-border bg-surface px-3 py-2 hover:border-accent"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-[1px]"
                      style={{ backgroundColor: STATUS_META[demand.status].color }}
                    />
                    <span className="truncate text-sm text-foreground">
                      {demand.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {demand.refKey?.split("-").reverse().join("/")}
                  </span>
                </Link>
              ))
          )}
        </div>
      )}
    </div>
  );
}
