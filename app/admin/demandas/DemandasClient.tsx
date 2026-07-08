"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  STATUS_ORDER,
  STATUS_META,
  type DemandCard,
  type ClientOption,
  type UserOption,
} from "@/lib/demand-meta";
import type { DemandStatus } from "@/app/generated/prisma/client";
import { KanbanView } from "./KanbanView";
import { ListView } from "./ListView";
import { NewDemandModal } from "./NewDemandModal";
import { updateDemandStatus } from "./actions";

const fieldClass =
  "h-9 rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";

type View = "kanban" | "list";

export function DemandasClient({
  demands,
  clients,
  users,
}: {
  demands: DemandCard[];
  clients: ClientOption[];
  users: UserOption[];
}) {
  const [view, setView] = useState<View>("kanban");
  const [filterClient, setFilterClient] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [optimisticDemands, applyOptimistic] = useOptimistic(
    demands,
    (state, moved: { id: string; status: DemandStatus }) =>
      state.map((demand) =>
        demand.id === moved.id ? { ...demand, status: moved.status } : demand,
      ),
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return optimisticDemands.filter((demand) => {
      if (filterClient) {
        if (filterClient === "__none__") {
          if (demand.client) return false;
        } else if (demand.client?.id !== filterClient) {
          return false;
        }
      }
      if (filterAssignee) {
        if (filterAssignee === "__none__") {
          if (demand.assignee) return false;
        } else if (demand.assignee?.id !== filterAssignee) {
          return false;
        }
      }
      if (filterStatus && demand.status !== filterStatus) return false;
      if (term && !demand.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [optimisticDemands, filterClient, filterAssignee, filterStatus, search]);

  function handleMove(id: string, status: DemandStatus) {
    const current = optimisticDemands.find((demand) => demand.id === id);
    if (!current || current.status === status) return;
    startTransition(async () => {
      applyOptimistic({ id, status });
      await updateDemandStatus(id, status);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded border border-border">
          {(["kanban", "list"] as const).map((value) => (
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
              {value === "kanban" ? "Kanban" : "Lista"}
            </button>
          ))}
        </div>

        <Button type="button" onClick={() => setModalOpen(true)}>
          + Nova demanda
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por título..."
          className={cn(fieldClass, "min-w-[200px] flex-1")}
        />

        <select
          value={filterClient}
          onChange={(event) => setFilterClient(event.target.value)}
          className={fieldClass}
        >
          <option value="">Todos os clientes</option>
          <option value="__none__">Interno (sem cliente)</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        <select
          value={filterAssignee}
          onChange={(event) => setFilterAssignee(event.target.value)}
          className={fieldClass}
        >
          <option value="">Todos os responsáveis</option>
          <option value="__none__">Sem responsável</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          className={fieldClass}
        >
          <option value="">Todos os status</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>
      </div>

      {view === "kanban" ? (
        <KanbanView demands={filtered} onMove={handleMove} />
      ) : (
        <ListView demands={filtered} />
      )}

      <NewDemandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clients={clients}
      />
    </div>
  );
}
