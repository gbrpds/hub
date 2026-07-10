import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfigForm } from "./ConfigForm";

export const dynamic = "force-dynamic";

export default async function AgentConfigPage() {
  const ownerId = await getCurrentAdminId();
  const config = ownerId
    ? await prisma.agentConfig.findUnique({
        where: { ownerId },
        select: { instructions: true },
      })
    : null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        index="05"
        title="Cérebro da marca"
        description="Sua metodologia de criação de conteúdo. O agente segue estas diretrizes em toda conversa, para todos os clientes."
        actions={
          <Link
            href="/admin/estudio"
            className="rounded-sm border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
          >
            ← Voltar ao estúdio
          </Link>
        }
      />

      <ConfigForm initialValue={config?.instructions ?? ""} />
    </div>
  );
}
