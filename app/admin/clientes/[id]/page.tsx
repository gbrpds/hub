import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "../../demandas/parts";
import {
  EditableField,
  StatusSelect,
  CopyButton,
  PhotoEditor,
  PortalAccessButton,
  ServiceTags,
} from "./fields";

export const dynamic = "force-dynamic";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      demands: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true },
      },
      financeEntries: { where: { status: "PAGO" }, select: { value: true } },
      users: { where: { role: "CLIENT" }, select: { id: true } },
    },
  });

  if (!client) notFound();

  const totalDemands = client.demands.length;
  const concludedDemands = client.demands.filter(
    (demand) => demand.status === "CONCLUIDO",
  ).length;
  const totalRevenue = client.financeEntries.reduce(
    (sum, entry) => sum + Number(entry.value),
    0,
  );
  const hasPortalAccess = client.users.length > 0;

  const aiContext = client.context ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/clientes"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Voltar para clientes
        </Link>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 rounded border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <PhotoEditor clientId={client.id} name={client.name} photoUrl={client.photoUrl} />
        <div className="flex flex-1 flex-col gap-2">
          <div className="max-w-sm">
            <EditableField
              clientId={client.id}
              field="name"
              label="Nome"
              initialValue={client.name}
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={client.status === "ATIVO" ? "success" : "outline"}>
              {client.status === "ATIVO" ? "Ativo" : "Inativo"}
            </Badge>
            <StatusSelect clientId={client.id} initial={client.status} />
          </div>
          <ServiceTags services={client.services} />
        </div>
      </div>

      {/* Contexto da IA */}
      <Section title="Contexto da IA">
        <p className="mb-2 text-xs text-muted">
          Descreva o cliente para usar como contexto em prompts de outras IAs.
        </p>
        <EditableField
          clientId={client.id}
          field="context"
          label=""
          initialValue={aiContext}
          multiline
          placeholder="Tom de voz, público, preferências, histórico..."
        />
        <div className="mt-2 flex justify-end">
          <CopyButton text={aiContext} />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Integrações */}
        <Section title="Integrações">
          <div className="flex flex-col gap-4">
            <EditableField
              clientId={client.id}
              field="whatsappGroupUrl"
              label="Grupo do WhatsApp"
              initialValue={client.whatsappGroupUrl ?? ""}
              placeholder="https://chat.whatsapp.com/..."
            />
            <EditableField
              clientId={client.id}
              field="driveUrl"
              label="Pasta do Google Drive"
              initialValue={client.driveUrl ?? ""}
              placeholder="https://drive.google.com/..."
            />
          </div>
        </Section>

        {/* Contato e redes */}
        <Section title="Contato e redes">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EditableField
              clientId={client.id}
              field="contactEmail"
              label="E-mail"
              type="email"
              initialValue={client.contactEmail ?? ""}
            />
            <EditableField
              clientId={client.id}
              field="contactPhone"
              label="Telefone"
              initialValue={client.contactPhone ?? ""}
            />
            <EditableField
              clientId={client.id}
              field="contactWebsite"
              label="Site"
              initialValue={client.contactWebsite ?? ""}
            />
            <EditableField
              clientId={client.id}
              field="contactInstagram"
              label="Instagram"
              initialValue={client.contactInstagram ?? ""}
            />
          </div>
        </Section>
      </div>

      {/* Demandas */}
      <Section
        title={`Demandas (${concludedDemands}/${totalDemands} concluídas)`}
      >
        {client.demands.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma demanda ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {client.demands.map((demand) => (
              <li
                key={demand.id}
                className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2"
              >
                <Link
                  href={`/admin/demandas/${demand.id}`}
                  className="truncate text-sm text-foreground hover:text-accent"
                >
                  {demand.title}
                </Link>
                <StatusBadge status={demand.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Financeiro */}
      <Section title="Financeiro">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <EditableField
            clientId={client.id}
            field="monthlyValue"
            label="Valor mensal (R$)"
            initialValue={client.monthlyValue ? String(client.monthlyValue) : ""}
            placeholder="1500,00"
          />
          <EditableField
            clientId={client.id}
            field="paymentDay"
            label="Dia de pagamento"
            initialValue={client.paymentDay ? String(client.paymentDay) : ""}
            placeholder="10"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Receita total gerada
            </span>
            <p className="flex h-10 items-center text-lg font-bold text-success">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <EditableField
            clientId={client.id}
            field="contractUrl"
            label="Link do contrato"
            initialValue={client.contractUrl ?? ""}
            placeholder="https://..."
          />
          {client.contractStartDate && (
            <p className="mt-2 text-xs text-muted">
              Início do contrato: {formatDate(client.contractStartDate)}
            </p>
          )}
        </div>
      </Section>

      {/* Acesso ao portal */}
      <Section title="Acesso ao portal do cliente">
        <p className="mb-3 text-sm text-muted">
          {hasPortalAccess
            ? "Este cliente tem acesso ao portal (login por magic link)."
            : "Este cliente ainda não tem acesso ao portal."}
        </p>
        <PortalAccessButton
          clientId={client.id}
          hasAccess={hasPortalAccess}
          hasEmail={Boolean(client.contactEmail)}
        />
      </Section>
    </div>
  );
}
