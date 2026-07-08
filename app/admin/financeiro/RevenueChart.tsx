"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

const ACCENT = "#ff5c00";

export type RevenuePoint = { label: string; value: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="flex gap-3" style={{ height: 200 }}>
      {data.map((point, index) => {
        const heightPct = (point.value / max) * 100;
        const active = hover === index;
        return (
          <div
            key={point.label}
            className="flex flex-1 flex-col gap-2"
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="relative flex w-full flex-1 items-end justify-center">
              {active && (
                <div className="absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-sm border border-border bg-surface px-2 py-1 text-xs text-foreground">
                  {formatCurrency(point.value)}
                </div>
              )}
              <div
                className="w-full rounded-t-[2px] transition-opacity"
                style={{
                  height: `${Math.max(heightPct, point.value > 0 ? 3 : 0)}%`,
                  backgroundColor: ACCENT,
                  opacity: active ? 1 : 0.85,
                }}
                title={`${point.label}: ${formatCurrency(point.value)}`}
              />
            </div>
            <span className="text-xs text-muted">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
