"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "./actions";

const fieldClass =
  "h-10 w-full rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";
const labelClass = "text-sm font-medium text-foreground";

export function NewClientModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal open={open} onClose={onClose} title="Novo cliente" className="max-w-2xl">
      <form
        action={async (formData) => {
          setPending(true);
          setError(null);
          try {
            const result = await createClient(formData);
            if (result?.ok) {
              onClose();
            } else {
              setError(result?.error ?? "Não foi possível criar o cliente.");
            }
          } catch {
            setError("Algo deu errado. Tente novamente.");
          } finally {
            setPending(false);
          }
        }}
        className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input name="name" label="Nome" required />
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Status</span>
            <select name="status" defaultValue="ATIVO" className={fieldClass}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </label>
        </div>

        <Input name="photoUrl" label="Foto (URL)" placeholder="https://..." />
        <Input
          name="services"
          label="Serviços prestados (separados por vírgula)"
          placeholder="Edição de vídeo, Social media, Design"
        />

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Contexto para IA</span>
          <textarea
            name="context"
            rows={3}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <Input name="contactEmail" label="E-mail" type="email" />
          <Input name="contactPhone" label="Telefone" />
          <Input name="contactWebsite" label="Site" />
          <Input name="contactInstagram" label="Instagram" placeholder="@usuario" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Início do contrato</span>
            <input type="date" name="contractStartDate" className={fieldClass} />
          </label>
          <Input name="monthlyValue" label="Valor mensal (R$)" placeholder="1500,00" />
          <Input name="paymentDay" label="Dia de pagamento" placeholder="10" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input name="contractUrl" label="Link do contrato" placeholder="https://..." />
          <Input name="driveUrl" label="Pasta do Google Drive" placeholder="https://..." />
          <Input
            name="whatsappGroupUrl"
            label="Grupo do WhatsApp"
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
