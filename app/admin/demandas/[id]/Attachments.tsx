"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FileUploader } from "@/components/upload/FileUploader";
import { mediaKind, BLUR_DATA_URL } from "@/lib/media";
import { addAttachment, deleteAttachment } from "../actions";
import type { AttachmentItem } from "./types";

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
  const [index, setIndex] = useState(0);
  const [, startTransition] = useTransition();

  const title = type === "CLIENTE" ? "Anexos do cliente" : "Entrega";

  const safeIndex = Math.min(index, Math.max(attachments.length - 1, 0));
  const current = attachments[safeIndex];

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-bold tracking-tight text-foreground">
          {title}{" "}
          <span className="text-muted">({attachments.length})</span>
        </h2>
        <FileUploader
          multiple={type === "ENTREGA"}
          onUploaded={(file) =>
            startTransition(() =>
              addAttachment(demandId, type, file.url, file.name),
            )
          }
        />
      </div>

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
