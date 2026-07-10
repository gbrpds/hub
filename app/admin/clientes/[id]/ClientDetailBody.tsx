import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { LinkChip } from "@/components/ui/LinkChip";
import { toHref, shortLabel } from "@/lib/links";
import { FolderIcon, InstagramIcon } from "@/components/ui/icons";
import { StatusBadge } from "../../demandas/parts";
import {
  EditableField,
  StatusSelect,
  CopyButton,
  PhotoEditor,
  PortalAccessButton,
  ServiceTags,
  InstagramsEditor,
  PaymentsEditor,
  ContractField,
  DeleteClientButton,
} from "./fields";
import type { ClientDetailData } from "./load";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-border bg-surface p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ClientDetailBody({ client }: { client: ClientDetailData }) {
  const concluded = client.demands.filter(
    (d) => d.status === "CONCLUIDO",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 rounded border border-border bg-surface p-5 sm:flex-row sm:items-center">
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
          {/* Links reduzidos e clicáveis */}
          {(client.instagrams.length > 0 ||
            client.driveUrl ||
            client.contactWebsite) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {client.instagrams.map((handle) => (
                <LinkChip
                  key={handle}
                  href={toHref("instagram", handle)}
                  icon={<InstagramIcon width={13} height={13} />}
                >
                  {shortLabel("instagram", handle)}
                </LinkChip>
              ))}
              {client.driveUrl && (
                <LinkChip
                  href={toHref("url", client.driveUrl)}
                  icon={<FolderIcon width={13} height={13} />}
                >
                  Drive
                </LinkChip>
              )}
            </div>
          )}
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
          initialValue={client.context ?? ""}
          multiline
          placeholder="Tom de voz, público, preferências, histórico..."
        />
        <div className="mt-2 flex justify-end">
          <CopyButton text={client.context ?? ""} />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Redes e links */}
        <Section title="Redes e links">
          <div className="flex flex-col gap-4">
            <InstagramsEditor clientId={client.id} initial={client.instagrams} />
            <EditableField
              clientId={client.id}
              field="driveUrl"
              label="Pasta do Google Drive"
              initialValue={client.driveUrl ?? ""}
              placeholder="https://drive.google.com/..."
            />
            <EditableField
              clientId={client.id}
              field="contactWebsite"
              label="Site"
              initialValue={client.contactWebsite ?? ""}
            />
          </div>
        </Section>

        {/* Contato */}
        <Section title="Contato">
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
          </div>
        </Section>
      </div>

      {/* Demandas */}
      <Section title={`Demandas (${concluded}/${client.demands.length} concluídas)`}>
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PaymentsEditor clientId={client.id} initial={client.payments} />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Receita total gerada
              </span>
              <p className="text-lg font-bold text-success">
                {formatCurrency(client.totalRevenue)}
              </p>
            </div>
            <ContractField
              clientId={client.id}
              contractUrl={client.contractUrl}
              noContract={client.noContract}
            />
            {client.contractStartDate && (
              <p className="text-xs text-muted">
                Início do contrato:{" "}
                {formatDate(new Date(client.contractStartDate))}
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Acesso ao portal */}
      <Section title="Acesso ao portal do cliente">
        <p className="mb-3 text-sm text-muted">
          {client.hasPortalAccess
            ? "Este cliente tem acesso ao portal (login por magic link)."
            : "Este cliente ainda não tem acesso ao portal."}
        </p>
        <PortalAccessButton
          clientId={client.id}
          hasAccess={client.hasPortalAccess}
          hasEmail={client.hasEmail}
        />
      </Section>

      {/* Zona de perigo */}
      <Section title="Excluir cliente">
        <p className="mb-3 text-sm text-muted">
          Remove o cliente e todos os dados vinculados. Não dá pra desfazer.
        </p>
        <DeleteClientButton clientId={client.id} />
      </Section>
    </div>
  );
}
