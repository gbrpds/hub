"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { addComment } from "../actions";
import type { CommentItem } from "./types";

export function Comments({
  demandId,
  comments,
}: {
  demandId: string;
  comments: CommentItem[];
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Atividade <span className="text-muted/70">({comments.length})</span>
      </h2>

      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <li key={comment.id} className="border border-border bg-surface p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-foreground">
                {comment.author?.name ?? comment.author?.email ?? "—"}
              </span>
              <span>{formatDate(new Date(comment.createdAt))}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {comment.text}
            </p>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted">Nenhum comentário ainda.</p>
        )}
      </ul>

      <form
        action={() => {
          const value = text.trim();
          if (!value) return;
          setText("");
          startTransition(() => addComment(demandId, value));
        }}
        className="mt-3 flex flex-col gap-2"
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="Escrever um comentário..."
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            Comentar
          </Button>
        </div>
      </form>
    </section>
  );
}
