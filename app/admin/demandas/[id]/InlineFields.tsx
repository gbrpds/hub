"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  STATUS_ORDER,
  STATUS_META,
  PRIORITY_ORDER,
  PRIORITY_META,
  type ClientOption,
  type UserOption,
} from "@/lib/demand-meta";
import { updateDemandField, updateDemandStatus } from "../actions";
import type { DetailDemand } from "./types";

const fieldClass =
  "h-9 w-full rounded border border-border bg-surface px-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted";

export function InlineFields({
  demand,
  clients,
  users,
}: {
  demand: DetailDemand;
  clients: ClientOption[];
  users: UserOption[];
}) {
  const [pending, startTransition] = useTransition();

  function setField(field: string, value: string) {
    startTransition(() => updateDemandField(demand.id, field, value));
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-70")}>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Status</span>
        <select
          defaultValue={demand.status}
          className={fieldClass}
          onChange={(event) =>
            startTransition(() => updateDemandStatus(demand.id, event.target.value))
          }
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Responsável</span>
        <select
          defaultValue={demand.assigneeId ?? ""}
          className={fieldClass}
          onChange={(event) => setField("assigneeId", event.target.value)}
        >
          <option value="">Sem responsável</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Prioridade</span>
        <select
          defaultValue={demand.priority}
          className={fieldClass}
          onChange={(event) => setField("priority", event.target.value)}
        >
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Cliente</span>
        <select
          defaultValue={demand.clientId ?? ""}
          className={fieldClass}
          onChange={(event) => setField("clientId", event.target.value)}
        >
          <option value="">Interno (sem cliente)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Data de entrega</span>
        <input
          type="date"
          defaultValue={demand.dueDate ? demand.dueDate.slice(0, 10) : ""}
          className={fieldClass}
          onChange={(event) => setField("dueDate", event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Data de publicação</span>
        <input
          type="date"
          defaultValue={demand.publishDate ? demand.publishDate.slice(0, 10) : ""}
          className={fieldClass}
          onChange={(event) => setField("publishDate", event.target.value)}
        />
      </label>
    </div>
  );
}
