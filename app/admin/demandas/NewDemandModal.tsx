"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PRIORITY_ORDER,
  PRIORITY_META,
  CONTENT_TYPE_ORDER,
  CONTENT_TYPE_LABEL,
  type ClientOption,
} from "@/lib/demand-meta";
import { createDemand } from "./actions";

const fieldClass =
  "h-10 w-full rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";

const labelClass = "text-sm font-medium text-foreground";

export function NewDemandModal({
  open,
  onClose,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  clients: ClientOption[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal open={open} onClose={onClose} title="Nova demanda" className="max-w-lg">
      <form
        action={async (formData) => {
          setPending(true);
          setError(null);
          try {
            const result = await createDemand(formData);
            if (result?.ok) {
              onClose();
            } else {
              setError(result?.error ?? "Não foi possível criar a demanda.");
            }
          } catch {
            setError("Algo deu errado. Tente novamente.");
          } finally {
            setPending(false);
          }
        }}
        className="flex flex-col gap-4"
      >
        <Input name="title" label="Título" placeholder="Nome da demanda" required />

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Cliente</span>
            <select name="clientId" defaultValue="" className={fieldClass}>
              <option value="">Interno (sem cliente)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Tipo de conteúdo</span>
            <select name="contentType" defaultValue="" className={fieldClass}>
              <option value="">—</option>
              {CONTENT_TYPE_ORDER.map((type) => (
                <option key={type} value={type}>
                  {CONTENT_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Prioridade</span>
            <select name="priority" defaultValue="MEDIA" className={fieldClass}>
              {PRIORITY_ORDER.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_META[priority].label}
                </option>
              ))}
            </select>
          </label>

          <div />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Data de entrega</span>
            <input type="date" name="dueDate" className={fieldClass} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Data de publicação</span>
            <input type="date" name="publishDate" className={fieldClass} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Descrição</span>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar demanda"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
