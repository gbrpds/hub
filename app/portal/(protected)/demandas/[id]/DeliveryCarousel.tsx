"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL } from "@/lib/media";

export type DeliveryItem = {
  url: string;
  fileName: string | null;
  kind: "image" | "video" | "other";
};

export function DeliveryCarousel({ items }: { items: DeliveryItem[] }) {
  const [index, setIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded border border-border bg-background text-sm text-muted">
        A entrega ainda não está disponível.
      </div>
    );
  }

  const safeIndex = Math.min(index, items.length - 1);
  const current = items[safeIndex];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center justify-center rounded border border-border bg-background">
        {current.kind === "image" ? (
          <div className="relative h-[420px] w-full">
            <Image
              src={current.url}
              alt={current.fileName ?? "entrega"}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-contain"
            />
          </div>
        ) : current.kind === "video" ? (
          <video
            src={current.url}
            controls
            className="max-h-[420px] w-full bg-black"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted">
            {current.fileName ?? "arquivo"}
          </div>
        )}

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setIndex((safeIndex - 1 + items.length) % items.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-background/80 px-3 py-2 text-foreground hover:bg-surface"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((safeIndex + 1) % items.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-background/80 px-3 py-2 text-foreground hover:bg-surface"
              aria-label="Próximo"
            >
              ›
            </button>
          </>
        )}
      </div>
      {items.length > 1 && (
        <p className="text-center text-xs text-muted">
          {safeIndex + 1} de {items.length}
        </p>
      )}
    </div>
  );
}
