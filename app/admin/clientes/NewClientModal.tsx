"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileUploader } from "@/components/upload/FileUploader";
import { PhotoCropUploader } from "@/components/upload/PhotoCropUploader";
import { PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createClient } from "./actions";

const fieldClass =
  "h-10 w-full rounded border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";
const labelClass = "text-sm font-medium text-foreground";

type PaymentRow = { value: string; dueDay: string };

export function NewClientModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [instagrams, setInstagrams] = useState<string[]>([]);
  const [instaInput, setInstaInput] = useState("");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [noContract, setNoContract] = useState(false);

  function reset() {
    setPhotoUrl(null);
    setInstagrams([]);
    setInstaInput("");
    setPayments([]);
    setContractUrl(null);
    setNoContract(false);
    setError(null);
  }

  function addInsta() {
    const v = instaInput.trim().replace(/^@/, "");
    if (!v || instagrams.includes(v)) {
      setInstaInput("");
      return;
    }
    setInstagrams([...instagrams, v]);
    setInstaInput("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo cliente"
      className="max-w-2xl"
    >
      <form
        action={async (formData) => {
          setPending(true);
          setError(null);
          formData.set("photoUrl", photoUrl ?? "");
          formData.set("instagrams", JSON.stringify(instagrams));
          formData.set("payments", JSON.stringify(payments));
          formData.set("contractUrl", noContract ? "" : contractUrl ?? "");
          formData.set("noContract", String(noContract));
          try {
            const result = await createClient(formData);
            if (result?.ok) {
              reset();
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
        className="flex max-h-[72vh] flex-col gap-4 overflow-y-auto pr-1"
      >
        <div className="flex items-center gap-4">
          <PhotoCropUploader
            name="Novo"
            photoUrl={photoUrl}
            size={64}
            label={photoUrl ? "Trocar foto" : "Enviar foto"}
            onUploaded={setPhotoUrl}
          />
          <div className="flex-1">
            <Input name="name" label="Nome" required />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Status</span>
            <select name="status" defaultValue="ATIVO" className={fieldClass}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </label>
        </div>

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

        {/* Instagram (vários) */}
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Instagram (pode adicionar vários)</span>
          {instagrams.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {instagrams.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-1 text-xs text-foreground"
                >
                  @{h}
                  <button
                    type="button"
                    onClick={() =>
                      setInstagrams(instagrams.filter((x) => x !== h))
                    }
                    className="text-muted hover:text-danger"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={instaInput}
              onChange={(e) => setInstaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInsta();
                }
              }}
              placeholder="@usuario"
              className={fieldClass}
            />
            <Button type="button" size="sm" variant="secondary" onClick={addInsta}>
              Adicionar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input name="contactEmail" label="E-mail" type="email" />
          <Input name="contactPhone" label="Telefone" />
          <Input name="contactWebsite" label="Site" />
          <Input name="driveUrl" label="Pasta do Google Drive" placeholder="https://..." />
        </div>

        {/* Pagamentos (vários) */}
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Pagamentos (valor + dia)</span>
          {payments.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted">
                {i + 1}
              </span>
              <input
                value={row.value}
                onChange={(e) =>
                  setPayments(
                    payments.map((r, idx) =>
                      idx === i ? { ...r, value: e.target.value } : r,
                    ),
                  )
                }
                placeholder="Valor (1500,00)"
                className={cn(fieldClass, "flex-1")}
              />
              <input
                value={row.dueDay}
                onChange={(e) =>
                  setPayments(
                    payments.map((r, idx) =>
                      idx === i ? { ...r, dueDay: e.target.value } : r,
                    ),
                  )
                }
                placeholder="Dia"
                inputMode="numeric"
                className={cn(fieldClass, "w-20 shrink-0")}
              />
              <button
                type="button"
                onClick={() => setPayments(payments.filter((_, idx) => idx !== i))}
                className="shrink-0 text-muted hover:text-danger"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPayments([...payments, { value: "", dueDay: "" }])}
            className="flex items-center justify-center gap-1.5 rounded-sm border border-dashed border-border py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <PlusIcon width={15} height={15} />
            Adicionar pagamento
          </button>
        </div>

        {/* Contrato */}
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Contrato</span>
          <div className="flex flex-wrap items-center gap-3">
            <div className={cn(noContract && "pointer-events-none opacity-50")}>
              <FileUploader
                label={contractUrl ? "Contrato anexado ✓" : "Anexar contrato (PDF)"}
                accept="application/pdf"
                disabled={noContract}
                onUploaded={(file) => setContractUrl(file.url)}
              />
            </div>
            <label className="ml-auto flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={noContract}
                onChange={(e) => setNoContract(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Não possui contrato
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Início do contrato</span>
            <input type="date" name="contractStartDate" className={fieldClass} />
          </label>
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
