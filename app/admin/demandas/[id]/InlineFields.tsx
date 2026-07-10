"use client";

import { ReactNode, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  STATUS_ORDER,
  STATUS_META,
  PRIORITY_ORDER,
  PRIORITY_META,
  type ClientOption,
  type UserOption,
} from "@/lib/demand-meta";
import {
  CalendarIcon,
  FlagIcon,
  FolderIcon,
  SendIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { updateDemandField, updateDemandStatus } from "../actions";
import type { DetailDemand } from "./types";

// Controle "invisível" que só ganha borda no hover/focus, estilo ClickUp.
const controlClass =
  "w-full rounded-sm border border-transparent bg-transparent px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-hover focus:border-accent focus:bg-surface focus:outline-none";

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-2 px-3 py-1.5">
      <span className="flex items-center gap-2 text-xs font-medium text-muted">
        <span className="text-muted/70">{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}

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
    <div
      className={cn(
        "divide-y divide-border rounded border border-border",
        pending && "opacity-70",
      )}
    >
      <Row icon={<span className="h-2.5 w-2.5 rounded-[1px]" style={{ backgroundColor: STATUS_META[demand.status].color }} />} label="Status">
        <select
          defaultValue={demand.status}
          className={controlClass}
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
      </Row>

      <Row icon={<UsersIcon width={14} height={14} />} label="Responsável">
        <select
          defaultValue={demand.assigneeId ?? ""}
          className={controlClass}
          onChange={(event) => setField("assigneeId", event.target.value)}
        >
          <option value="">Sem responsável</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email}
            </option>
          ))}
        </select>
      </Row>

      <Row icon={<FlagIcon width={14} height={14} />} label="Prioridade">
        <select
          defaultValue={demand.priority}
          className={controlClass}
          onChange={(event) => setField("priority", event.target.value)}
        >
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>
      </Row>

      <Row icon={<FolderIcon width={14} height={14} />} label="Cliente">
        <select
          defaultValue={demand.clientId ?? ""}
          className={controlClass}
          onChange={(event) => setField("clientId", event.target.value)}
        >
          <option value="">Interno (sem cliente)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </Row>

      <Row icon={<CalendarIcon width={14} height={14} />} label="Entrega">
        <input
          type="date"
          defaultValue={demand.dueDate ? demand.dueDate.slice(0, 10) : ""}
          className={controlClass}
          onChange={(event) => setField("dueDate", event.target.value)}
        />
      </Row>

      <Row icon={<SendIcon width={14} height={14} />} label="Publicação">
        <input
          type="date"
          defaultValue={demand.publishDate ? demand.publishDate.slice(0, 10) : ""}
          className={controlClass}
          onChange={(event) => setField("publishDate", event.target.value)}
        />
      </Row>
    </div>
  );
}
