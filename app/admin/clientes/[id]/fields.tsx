"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FileUploader } from "@/components/upload/FileUploader";
import { updateClientField, toggleClientPortalAccess } from "../actions";

const inputClass =
  "h-10 w-full rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted";

export function EditableField({
  clientId,
  field,
  label,
  initialValue,
  type = "text",
  placeholder,
  multiline,
}: {
  clientId: string;
  field: string;
  label: string;
  initialValue: string;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  function save() {
    if (value === initialValue) return;
    startTransition(() => updateClientField(clientId, field, value));
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={save}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={save}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </label>
  );
}

export function StatusSelect({
  clientId,
  initial,
}: {
  clientId: string;
  initial: "ATIVO" | "INATIVO";
}) {
  const [, startTransition] = useTransition();
  return (
    <select
      defaultValue={initial}
      onChange={(event) =>
        startTransition(() =>
          updateClientField(clientId, "status", event.target.value),
        )
      }
      className="h-8 rounded border border-border bg-surface px-2 text-sm text-foreground focus:border-accent focus:outline-none"
    >
      <option value="ATIVO">Ativo</option>
      <option value="INATIVO">Inativo</option>
    </select>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copiado!" : "Copiar"}
    </Button>
  );
}

export function PhotoEditor({
  clientId,
  name,
  photoUrl,
}: {
  clientId: string;
  name: string;
  photoUrl: string | null;
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar name={name} photoUrl={photoUrl} size={80} />
      <FileUploader
        label="Trocar foto"
        accept="image/*"
        onUploaded={(file) =>
          startTransition(() =>
            updateClientField(clientId, "photoUrl", file.url),
          )
        }
      />
    </div>
  );
}

// Upload do contrato (PDF ou imagem) — grava a URL em contractUrl.
export function ContractUploader({ clientId }: { clientId: string }) {
  const [, startTransition] = useTransition();
  return (
    <FileUploader
      label="Enviar contrato"
      accept="application/pdf,image/*"
      onUploaded={(file) =>
        startTransition(() =>
          updateClientField(clientId, "contractUrl", file.url),
        )
      }
    />
  );
}

export function PortalAccessButton({
  clientId,
  hasAccess,
  hasEmail,
}: {
  clientId: string;
  hasAccess: boolean;
  hasEmail: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (!hasAccess && !hasEmail) {
    return (
      <p className="text-xs text-muted">
        Cadastre um e-mail de contato para poder liberar o acesso ao portal.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant={hasAccess ? "danger" : "primary"}
      disabled={isPending}
      onClick={() =>
        startTransition(() => toggleClientPortalAccess(clientId))
      }
    >
      {hasAccess ? "Revogar acesso ao portal" : "Dar acesso ao portal"}
    </Button>
  );
}

export function ServiceTags({ services }: { services: string[] }) {
  if (services.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1")}>
      {services.map((service) => (
        <span
          key={service}
          className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted"
        >
          {service}
        </span>
      ))}
    </div>
  );
}
