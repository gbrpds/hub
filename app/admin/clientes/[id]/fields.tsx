"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { FileUploader } from "@/components/upload/FileUploader";
import { PhotoCropUploader } from "@/components/upload/PhotoCropUploader";
import { PlusIcon } from "@/components/ui/icons";
import {
  updateClientField,
  updateClientPayments,
  deleteClient,
  toggleClientPortalAccess,
} from "../actions";

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
      {label && <span className={labelClass}>{label}</span>}
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
    <PhotoCropUploader
      name={name}
      photoUrl={photoUrl}
      label="Trocar foto"
      onUploaded={(url) =>
        startTransition(() => updateClientField(clientId, "photoUrl", url))
      }
    />
  );
}

// Vários @ do Instagram como chips (adicionar/remover).
export function InstagramsEditor({
  clientId,
  initial,
}: {
  clientId: string;
  initial: string[];
}) {
  const [list, setList] = useState(initial);
  const [value, setValue] = useState("");
  const [, startTransition] = useTransition();

  function persist(next: string[]) {
    setList(next);
    startTransition(() =>
      updateClientField(clientId, "instagrams", JSON.stringify(next)),
    );
  }
  function add() {
    const v = value.trim().replace(/^@/, "");
    if (!v || list.includes(v)) {
      setValue("");
      return;
    }
    persist([...list, v]);
    setValue("");
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>Instagram</span>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {list.map((handle) => (
            <span
              key={handle}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-1 text-xs text-foreground"
            >
              @{handle}
              <button
                type="button"
                onClick={() => persist(list.filter((h) => h !== handle))}
                className="text-muted hover:text-danger"
                aria-label="Remover"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="@usuario"
          className={inputClass}
        />
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}

type PaymentRow = { label: string; value: string; dueDay: string };

// Múltiplos pagamentos (valor + dia). Persiste substituindo a lista inteira.
export function PaymentsEditor({
  clientId,
  initial,
}: {
  clientId: string;
  initial: PaymentRow[];
}) {
  const [rows, setRows] = useState<PaymentRow[]>(initial);
  const [, startTransition] = useTransition();

  function persist(next: PaymentRow[]) {
    setRows(next);
    startTransition(() =>
      updateClientPayments(
        clientId,
        next.map((r) => ({ label: r.label, value: r.value, dueDay: r.dueDay })),
      ),
    );
  }
  function update(i: number, patch: Partial<PaymentRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  const total = rows.reduce((s, r) => {
    const n = Number(r.value.replace(/\./g, "").replace(",", "."));
    return s + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={labelClass}>Pagamentos</span>
        {rows.length > 0 && (
          <span className="text-xs text-muted">
            Total:{" "}
            <span className="font-semibold text-foreground">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted">
              {i + 1}
            </span>
            <input
              value={row.value}
              onChange={(e) => update(i, { value: e.target.value })}
              onBlur={() => persist(rows)}
              placeholder="Valor (1500,00)"
              className={cn(inputClass, "flex-1")}
            />
            <input
              value={row.dueDay}
              onChange={(e) => update(i, { dueDay: e.target.value })}
              onBlur={() => persist(rows)}
              placeholder="Dia"
              inputMode="numeric"
              className={cn(inputClass, "w-20 shrink-0")}
            />
            <button
              type="button"
              onClick={() => persist(rows.filter((_, idx) => idx !== i))}
              aria-label="Remover pagamento"
              className="shrink-0 text-muted transition-colors hover:text-danger"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows([...rows, { label: "", value: "", dueDay: "" }])}
        className="flex items-center justify-center gap-1.5 rounded-sm border border-dashed border-border py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
      >
        <PlusIcon width={15} height={15} />
        Adicionar pagamento
      </button>
    </div>
  );
}

// Contrato: anexar PDF ou marcar "Não possui contrato".
export function ContractField({
  clientId,
  contractUrl,
  noContract,
}: {
  clientId: string;
  contractUrl: string | null;
  noContract: boolean;
}) {
  const [noC, setNoC] = useState(noContract);
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <span className={labelClass}>Contrato</span>
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn(noC && "pointer-events-none opacity-50")}>
          <FileUploader
            label="Anexar contrato (PDF)"
            accept="application/pdf"
            disabled={noC}
            onUploaded={(file) =>
              startTransition(() =>
                updateClientField(clientId, "contractUrl", file.url),
              )
            }
          />
        </div>
        {contractUrl && !noC && (
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Ver contrato atual
          </a>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={noC}
            onChange={(e) => {
              setNoC(e.target.checked);
              startTransition(() =>
                updateClientField(
                  clientId,
                  "noContract",
                  String(e.target.checked),
                ),
              );
            }}
            className="h-4 w-4 accent-accent"
          />
          Não possui contrato
        </label>
      </div>
    </div>
  );
}

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="danger"
        onClick={() => setConfirming(true)}
      >
        Excluir cliente
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-danger">
        Tem certeza? Isso apaga o cliente e suas demandas.
      </span>
      <Button
        type="button"
        variant="danger"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteClient(clientId);
            router.push("/admin/clientes");
          })
        }
      >
        {pending ? "Excluindo..." : "Confirmar exclusão"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(false)}
      >
        Cancelar
      </Button>
    </div>
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
      onClick={() => startTransition(() => toggleClientPortalAccess(clientId))}
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
