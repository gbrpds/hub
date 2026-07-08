"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createUploadUrl } from "@/app/upload-actions";

export const DEFAULT_MAX_BYTES = 500 * 1024 * 1024; // 500MB
export const DEFAULT_ACCEPT = "image/*,video/*,application/pdf";

type UploadStatus = "uploading" | "done" | "error";

type UploadItem = {
  id: string;
  name: string;
  progress: number; // 0..1
  status: UploadStatus;
  xhr?: XMLHttpRequest;
};

function isAllowedType(type: string) {
  return (
    type.startsWith("image/") ||
    type.startsWith("video/") ||
    type === "application/pdf"
  );
}

export function FileUploader({
  onUploaded,
  multiple = false,
  maxBytes = DEFAULT_MAX_BYTES,
  accept = DEFAULT_ACCEPT,
  label = "Enviar arquivo",
  disabled = false,
  variant = "button",
}: {
  onUploaded: (file: { url: string; name: string }) => void;
  multiple?: boolean;
  maxBytes?: number;
  accept?: string;
  label?: string;
  disabled?: boolean;
  variant?: "button" | "dropzone";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const maxMb = Math.round(maxBytes / 1024 / 1024);

  function update(id: string, patch: Partial<UploadItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function startUpload(file: File) {
    const id = crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      { id, name: file.name, progress: 0, status: "uploading" },
    ]);

    let target;
    try {
      target = await createUploadUrl(file.name, file.type);
    } catch (err) {
      update(id, { status: "error" });
      setError(err instanceof Error ? err.message : "Falha ao iniciar upload.");
      return;
    }

    if (!target.ok) {
      update(id, { status: "error" });
      setError(target.error);
      return;
    }

    const uploadUrl = target.uploadUrl;
    const publicUrl = target.publicUrl;

    // O Storage do Supabase espera multipart/form-data com o arquivo no
    // campo de nome vazio ("") e um campo cacheControl — igual ao que o
    // supabase-js faz internamente. NÃO definir content-type: o navegador
    // seta o boundary do multipart automaticamente.
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);

    const xhr = new XMLHttpRequest();
    update(id, { xhr });
    xhr.open("PUT", uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        update(id, { progress: event.loaded / event.total });
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        update(id, { status: "done", progress: 1 });
        onUploaded({ url: publicUrl, name: file.name });
        setTimeout(() => remove(id), 700);
      } else {
        console.error("Upload falhou:", xhr.status, xhr.responseText);
        update(id, { status: "error" });
        setError(
          `Envio recusado pelo Storage (${xhr.status}). ${xhr.responseText?.slice(0, 200) ?? ""}`,
        );
      }
    };
    xhr.onerror = () => {
      update(id, { status: "error" });
      setError("Falha de rede ao enviar o arquivo para o Storage.");
    };
    xhr.onabort = () => remove(id);
    xhr.send(form);
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);
    for (const file of Array.from(fileList)) {
      if (!isAllowedType(file.type)) {
        setError(`"${file.name}": tipo não suportado (só imagens, vídeos e PDF).`);
        continue;
      }
      if (file.size > maxBytes) {
        setError(`"${file.name}": passa de ${maxMb}MB.`);
        continue;
      }
      startUpload(file);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function cancel(id: string) {
    const item = items.find((it) => it.id === id);
    item?.xhr?.abort();
  }

  return (
    <div className="flex flex-col gap-2">
      {variant === "dropzone" ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted transition-colors hover:border-accent",
            dragging && "border-accent bg-surface",
          )}
        >
          Arraste arquivos aqui ou clique para escolher
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-1 rounded-sm border border-border bg-background p-2"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-foreground">{item.name}</span>
                <span
                  className={cn(
                    "shrink-0",
                    item.status === "error" ? "text-danger" : "text-muted",
                  )}
                >
                  {item.status === "error"
                    ? "Falhou"
                    : `${Math.round(item.progress * 100)}%`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-[1px] bg-surface-hover">
                <div
                  className={cn(
                    "h-full transition-all",
                    item.status === "error" ? "bg-danger" : "bg-accent",
                  )}
                  style={{ width: `${Math.round(item.progress * 100)}%` }}
                />
              </div>
              {item.status === "uploading" && (
                <button
                  type="button"
                  onClick={() => cancel(item.id)}
                  className="self-end text-[11px] text-muted hover:text-danger"
                >
                  Cancelar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
