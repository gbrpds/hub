import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { CLIENT_STATUS_META } from "@/lib/demand-meta";

export const dynamic = "force-dynamic";

function StatusPill({ status }: { status: keyof typeof CLIENT_STATUS_META }) {
  const meta = CLIENT_STATUS_META[status];
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

export default async function PortalHomePage() {
  const clientId = await getCurrentClientId();

  const client = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
      })
    : null;

  const demands = clientId
    ? await prisma.demand.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, status: true },
      })
    : [];

  const firstName = client?.name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá{firstName ? `, ${firstName}` : ""}! 👋
        </h1>
        <p className="mt-2 text-muted">
          Aqui você acompanha seus conteúdos e pede novos.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/portal/nova-demanda"
          className="rounded-sm bg-accent px-5 py-3 font-semibold text-accent-foreground hover:opacity-90"
        >
          + Nova demanda
        </Link>
        <Link
          href="/portal/cronograma"
          className="rounded-sm border border-border bg-surface px-5 py-3 font-semibold text-foreground hover:bg-surface-hover"
        >
          Ver cronograma
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold tracking-tight text-foreground">
          Seus conteúdos recentes
        </h2>
        {demands.length === 0 ? (
          <p className="text-sm text-muted">
            Você ainda não tem conteúdos. Que tal pedir o primeiro?
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {demands.map((demand) => (
              <li key={demand.id}>
                <Link
                  href={`/portal/demandas/${demand.id}`}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border bg-surface px-4 py-3 hover:border-accent"
                >
                  <span className="truncate font-medium text-foreground">
                    {demand.title}
                  </span>
                  <StatusPill status={demand.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
