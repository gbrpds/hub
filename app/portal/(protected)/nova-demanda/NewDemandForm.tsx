"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileUploader } from "@/components/upload/FileUploader";
import { mediaKind, BLUR_DATA_URL } from "@/lib/media";
import { createClientDemand } from "@/app/portal/actions";

const CONTENT_TYPES = [
  { value: "", label: "Não sei / tanto faz" },
  { value: "POST", label: "Post" },
  { value: "CARROSSEL", label: "Carrossel" },
  { value: "REELS", label: "Reels" },
  { value: "STORY", label: "Story" },
  { value: "VIDEO_LONGO", label: "Vídeo longo" },
];

const PRIORITIES = [
  { value: "URGENTE", label: "Urgente", hint: "Prazo mais curto — em até 24h úteis" },
  { value: "ALTA", label: "Alta", hint: "Rápido — 2 a 3 dias" },
  { value: "MEDIA", label: "Média", hint: "Prazo normal — até 1 semana" },
  { value: "BAIXA", label: "Baixa", hint: "Sem pressa — quando encaixar" },
];

const fieldClass =
  "h-11 w-full rounded border border-border bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none";

type Attached = { name: string; url: string };

export function NewDemandForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [contentType, setContentType] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [priority, setPriority] = useState("MEDIA");
  const [files, setFiles] = useState<Attached[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) {
      setError("Dê um nome para o seu pedido.");
      return;
    }
    startTransition(async () => {
      const result = await createClientDemand({
        title,
        details,
        contentType,
        publishDate,
        priority,
        attachments: files,
      });
      if (result.ok) {
        router.push("/portal/demandas");
        router.refresh();
      } else {
        setError("Não foi possível enviar. Tente novamente.");
      }
    });
  }

  return (
    <form
      action={submit}
      className="flex flex-col gap-5 rounded border border-border bg-surface p-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          O que você precisa? *
        </label>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex: Post de aniversário da loja"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Conte os detalhes
        </label>
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={5}
          placeholder="Explique o que você imagina, a mensagem principal, o tom..."
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Anexos (fotos, vídeos, referências)
        </label>
        <FileUploader
          variant="dropzone"
          multiple
          onUploaded={(file) => setFiles((prev) => [...prev, file])}
        />
        {files.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex flex-col gap-1 rounded-sm border border-border bg-background p-1"
              >
                {mediaKind(file.url, file.name) === "image" ? (
                  <div className="relative h-20 w-full">
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="rounded-sm object-cover"
                    />
                  </div>
                ) : mediaKind(file.url, file.name) === "video" ? (
                  <video src={file.url} className="h-20 w-full rounded-sm bg-black" />
                ) : (
                  <div className="flex h-20 items-center justify-center text-xs text-muted">
                    arquivo
                  </div>
                )}
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[10px] text-muted">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-[10px] text-danger hover:underline"
                  >
                    remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Tipo de conteúdo
          </label>
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value)}
            className={fieldClass}
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Quer publicar em algum dia? (opcional)
          </label>
          <input
            type="date"
            value={publishDate}
            onChange={(event) => setPublishDate(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Qual a urgência?
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PRIORITIES.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-2 rounded border p-3 transition-colors",
                priority === option.value
                  ? "border-accent bg-surface-hover"
                  : "border-border bg-background hover:bg-surface",
              )}
            >
              <input
                type="radio"
                name="priority"
                value={option.value}
                checked={priority === option.value}
                onChange={() => setPriority(option.value)}
                className="mt-0.5 accent-accent"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {option.label}
                </span>
                <span className="block text-xs text-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Enviando..." : "Enviar demanda"}
        </Button>
      </div>
    </form>
  );
}
