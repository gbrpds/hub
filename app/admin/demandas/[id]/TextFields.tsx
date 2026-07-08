"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateDemandField } from "../actions";
import type { DetailDemand } from "./types";

const CAPTION_SOFT_LIMIT = 2200;

const textareaClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none";

export function TextFields({ demand }: { demand: DetailDemand }) {
  const [description, setDescription] = useState(demand.description ?? "");
  const [caption, setCaption] = useState(demand.caption ?? "");
  const [, startTransition] = useTransition();

  function saveIfChanged(field: "description" | "caption", value: string) {
    const original = (field === "description" ? demand.description : demand.caption) ?? "";
    if (value === original) return;
    startTransition(() => updateDemandField(demand.id, field, value));
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-bold tracking-tight text-foreground">
          Descrição
        </h2>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={() => saveIfChanged("description", description)}
          rows={4}
          placeholder="Detalhes da demanda..."
          className={textareaClass}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Legenda
          </h2>
          <span
            className={cn(
              "text-xs text-muted",
              caption.length > CAPTION_SOFT_LIMIT && "text-danger",
            )}
          >
            {caption.length} / {CAPTION_SOFT_LIMIT}
          </span>
        </div>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          onBlur={() => saveIfChanged("caption", caption)}
          rows={5}
          placeholder="Texto do post/vídeo..."
          className={textareaClass}
        />
      </section>
    </div>
  );
}
