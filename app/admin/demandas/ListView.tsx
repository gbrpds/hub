// Só renderiza a tabela (sem estado/eventos) — não precisa ser client.
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { CONTENT_TYPE_LABEL, type DemandCard } from "@/lib/demand-meta";
import { Avatar, PriorityTag, StatusBadge } from "./parts";

export function ListView({ demands }: { demands: DemandCard[] }) {
  if (demands.length === 0) {
    return <p className="text-sm text-muted">Nenhuma demanda encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-border">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2 font-semibold">Título</th>
            <th className="px-3 py-2 font-semibold">Cliente</th>
            <th className="px-3 py-2 font-semibold">Responsável</th>
            <th className="px-3 py-2 font-semibold">Prioridade</th>
            <th className="px-3 py-2 font-semibold">Entrega</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {demands.map((demand) => (
            <tr
              key={demand.id}
              className="border-b border-border last:border-0 hover:bg-surface"
            >
              <td className="px-3 py-2">
                <Link
                  href={`/admin/demandas/${demand.id}`}
                  className="font-medium text-foreground hover:text-accent"
                >
                  {demand.title}
                </Link>
                {demand.contentType && (
                  <span className="ml-2 text-xs text-muted">
                    {CONTENT_TYPE_LABEL[demand.contentType]}
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                {demand.client ? (
                  <span className="flex items-center gap-2">
                    <Avatar
                      name={demand.client.name}
                      photoUrl={demand.client.photoUrl}
                      size={20}
                    />
                    <span className="text-foreground">{demand.client.name}</span>
                  </span>
                ) : (
                  <span className="text-muted">Interno</span>
                )}
              </td>
              <td className="px-3 py-2 text-muted">
                {demand.assignee
                  ? demand.assignee.name ?? demand.assignee.email
                  : "—"}
              </td>
              <td className="px-3 py-2">
                <PriorityTag priority={demand.priority} />
              </td>
              <td className="px-3 py-2 text-muted">
                {demand.dueDate ? formatDate(new Date(demand.dueDate)) : "—"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={demand.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
