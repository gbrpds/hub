"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LinkChip, toHref, shortLabel } from "@/components/ui/LinkChip";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import {
  FolderIcon,
  InstagramIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { NewClientModal } from "./NewClientModal";

export type ClientCard = {
  id: string;
  name: string;
  photoUrl: string | null;
  status: "ATIVO" | "INATIVO";
  services: string[];
  instagrams: string[];
  contactWebsite: string | null;
  driveUrl: string | null;
  demandCount: number;
};

const fieldClass =
  "h-9 rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";

export function ClientesClient({
  clients,
  hasMore,
  nextTake,
}: {
  clients: ClientCard[];
  hasMore: boolean;
  nextTake: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingMore, startLoadMore] = useTransition();

  const allServices = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((client) => client.services.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [clients]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((client) => {
      if (serviceFilter && !client.services.includes(serviceFilter)) return false;
      if (term) {
        const inName = client.name.toLowerCase().includes(term);
        const inInsta = client.instagrams.some((h) =>
          h.toLowerCase().includes(term),
        );
        if (!inName && !inInsta) return false;
      }
      return true;
    });
  }, [clients, search, serviceFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou @instagram..."
            className={cn(fieldClass, "min-w-[240px]")}
          />
          <select
            value={serviceFilter}
            onChange={(event) => setServiceFilter(event.target.value)}
            className={fieldClass}
          >
            <option value="">Todos os serviços</option>
            {allServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={() => setModalOpen(true)}>
          + Novo cliente
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Nenhum cliente encontrado.</p>
      ) : (
        <StaggerContainer
          key={`${search}|${serviceFilter}`}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((client) => (
            <StaggerItem
              key={client.id}
              className="group flex cursor-pointer flex-col gap-3 rounded border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_16px_36px_-18px_rgba(255,122,61,0.25)]"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/clientes/${client.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/admin/clientes/${client.id}`);
                  }
                }}
                className="flex flex-col gap-3 outline-none"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={client.name} photoUrl={client.photoUrl} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-foreground group-hover:text-accent">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted">
                      {client.demandCount}{" "}
                      {client.demandCount === 1 ? "demanda" : "demandas"}
                    </p>
                  </div>
                  <Badge variant={client.status === "ATIVO" ? "success" : "outline"}>
                    {client.status === "ATIVO" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {client.services.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {client.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Links reduzidos e clicáveis (não abrem a ficha) */}
              {(client.instagrams.length > 0 ||
                client.driveUrl ||
                client.contactWebsite) && (
                <div className="mt-auto flex flex-wrap gap-1.5">
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
                  {client.contactWebsite && (
                    <LinkChip
                      href={toHref("url", client.contactWebsite)}
                      icon={<UsersIcon width={13} height={13} />}
                    >
                      {shortLabel("url", client.contactWebsite)}
                    </LinkChip>
                  )}
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            disabled={loadingMore}
            onClick={() =>
              startLoadMore(() =>
                router.push(`/admin/clientes?take=${nextTake}`, { scroll: false }),
              )
            }
          >
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}

      <NewClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
