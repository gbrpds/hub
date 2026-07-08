import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CronogramaClient, type CalendarDemand } from "./CronogramaClient";

export const dynamic = "force-dynamic";

export default async function ClientCronogramaPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      demands: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          publishDate: true,
          dueDate: true,
        },
      },
    },
  });

  if (!client) notFound();

  const demands: CalendarDemand[] = client.demands.map((demand) => {
    const ref = demand.publishDate ?? demand.dueDate;
    return {
      id: demand.id,
      title: demand.title,
      status: demand.status,
      // YYYY-MM-DD à prova de fuso (usa a data de publicação, ou a de
      // entrega como fallback).
      refKey: ref ? ref.toISOString().slice(0, 10) : null,
    };
  });

  return (
    <div>
      <Link
        href="/admin/cronograma"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para clientes
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        Cronograma · {client.name}
      </h1>

      <div className="mt-6">
        <CronogramaClient demands={demands} />
      </div>
    </div>
  );
}
