"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { mediaKind, BLUR_DATA_URL } from "@/lib/media";
import { addAttachment, deleteAttachment } from "../actions";
import type { AttachmentItem } from "./types";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB por arquivo

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Preview({ attachment }: { attachment: AttachmentItem }) {
  const kind = mediaKind(attachment.url, attachment.fileName);

  if (kind === "image") {
    return (
      <div className="relative h-72 w-full rounded-sm border border-border bg-background">
        <Image
          src={attachment.url}
          alt={attachment.fileName ?? "anexo"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-contain"
        />
      </div>
    );
  }
  if (kind === "video") {
    return (
      <video
        src={attachment.url}
        controls
        className="max-h-72 w-full rounded-sm border border-border bg-background"
      />
    );
  }
  return (
    <div className="flex h-24 items-center justify-center rounded-sm border border-border bg-background text-xs text-muted">
      {attachment.fileName ?? "arquivo"}
    </div>
  );
}

export function Attachments({
  demandId,
  type,
  attachments,
  variant,
}: {
  demandId: string;
  type: "CLIENTE" | "ENTREGA";
  attachments: AttachmentItem[];
  variant: "grid" | "carousel";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const title = type === "CLIENTE" ? "Anexos do cliente" : "Entrega";

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" passa de 8MB e não foi enviado.`);
        continue;
      }
      const url = await readAsDataUrl(file);
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          await addAttachment(demandId, type, url, file.name);
          resolve();
        });
      });
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  const safeIndex = Math.min(index, Math.max(attachments.length - 1, 0));
  const current = attachments[safeIndex];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-foreground">
          {title}{" "}
          <span className="text-muted">({attachments.length})</span>
        </h2>
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Enviando..." : "Enviar arquivo"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={type === "ENTREGA"}
          accept="image/*,video/*"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {attachments.length === 0 ? (
        <p className="text-sm text-muted">Nenhum arquivo ainda.</p>
      ) : variant === "carousel" ? (
        <div className="flex flex-col gap-2">
          <div className="relative">
            {current && <Preview attachment={current} />}
            {attachments.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setIndex(
                      (safeIndex - 1 + attachments.length) % attachments.length,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-background/80 px-2 py-1 text-sm text-foreground hover:bg-surface"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((safeIndex + 1) % attachments.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-background/80 px-2 py-1 text-sm text-foreground hover:bg-surface"
                  aria-label="Próximo"
                >
                  ›
                </button>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">
              {safeIndex + 1} / {attachments.length}
              {current?.fileName ? ` · ${current.fileName}` : ""}
            </span>
            {current && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  startTransition(() => deleteAttachment(current.id))
                }
              >
                Excluir
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex flex-col gap-1">
              <Preview attachment={attachment} />
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-muted">
                  {attachment.fileName ?? "arquivo"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    startTransition(() => deleteAttachment(attachment.id))
                  }
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
