"use client";

import { STATUS_META, PRIORITY_META } from "@/lib/demand-meta";
import type { DemandStatus, Priority } from "@/app/generated/prisma/client";

export function Avatar({
  name,
  photoUrl,
  size = 20,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className="shrink-0 rounded-sm border border-border object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-sm border border-border bg-surface-hover text-[10px] font-bold text-muted"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

export function StatusBadge({ status }: { status: DemandStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
      <span
        className="h-2 w-2 rounded-[1px]"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: meta.color }}
    >
      <span
        className="h-2 w-2 rounded-[1px]"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
