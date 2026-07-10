"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FileUploader } from "@/components/upload/FileUploader";
import { FileIcon } from "@/components/ui/icons";
import { mediaKind, BLUR_DATA_URL } from "@/lib/media";
import { addAttachment, deleteAttachment } from "../actions";
import type { AttachmentItem } from "./types";

function fileExt(name: string | null) {
  if (!name) return "";
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : "";
}

function Preview({
  attachment,
  heightClass = "h-32",
}: {
  attachment: AttachmentItem;
  heightClass?: string;
}) {
  const kind = mediaKind(attachment.url, attachment.fileName);

  if (kind === "image") {
    return (
      <div className={`relative ${heightClass} w-full rounded-sm border border-border bg-background`}>
        <Image
          src={attachment.url}
          alt={attachment.fileName ?? "anexo"}
          fill
          sizes="(max-width: 768px) 50vw, 240px"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="rounded-sm object-cover"
        />
      </div>
    );
  }
  if (kind === "video") {
    return (
      <video
        src={attachment.url}
        controls
        className={`${heightClass} w-full rounded-sm border border-border bg-background object-cover`}
      />
    );
  }
  return (
    <div className={`flex ${heightClass} flex-col items-center justify-center gap-1.5 rounded-sm border border-border bg-background text-muted`}>
      <FileIcon width={26} height={26} />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {fileExt(attachment.fileName) || "arquivo"}
      </span>
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
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {title}{" "}
          <span className="text-muted/70">({attachments.length})</span>
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
            {current && <Preview attachment={current} heightClass="h-64" />}
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="group flex flex-col gap-1">
              <Preview attachment={attachment} />
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs text-muted">
                  {attachment.fileName ?? "arquivo"}
                </span>
                <button
                  type="button"
                  aria-label="Excluir anexo"
                  onClick={() =>
                    startTransition(() => deleteAttachment(attachment.id))
                  }
                  className="shrink-0 text-xs text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
