import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { CLIENT_STATUS_META } from "@/lib/demand-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ArrowRightIcon,
  CalendarIcon,
  FolderIcon,
  PlusIcon,
} from "@/components/ui/icons";

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
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Olá${firstName ? `, ${firstName}` : ""}! 👋`}
        description="Aqui você acompanha seus conteúdos e pede novos."
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/portal/nova-demanda"
          className="shine flex items-center gap-2 rounded bg-gradient-accent px-5 py-3 font-semibold text-accent-foreground shadow-[0_2px_10px_-3px_rgba(255,122,61,0.5)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_28px_-6px_rgba(255,122,61,0.7)]"
        >
          <PlusIcon width={18} height={18} />
          Nova demanda
        </Link>
        <Link
          href="/portal/cronograma"
          className="flex items-center gap-2 rounded border border-border bg-surface px-5 py-3 font-semibold text-foreground transition-all duration-200 hover:-translate-y-px hover:border-accent/50"
        >
          <CalendarIcon width={18} height={18} />
          Ver cronograma
        </Link>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
          <span className="text-accent">
            <FolderIcon width={16} height={16} />
          </span>
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
                  className="group flex items-center justify-between gap-3 rounded-sm border border-border bg-surface px-4 py-3 transition-all duration-200 hover:border-accent/50 hover:bg-surface-hover"
                >
                  <span className="truncate font-medium text-foreground">
                    {demand.title}
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusPill status={demand.status} />
                    <ArrowRightIcon
                      width={15}
                      height={15}
                      className="shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
