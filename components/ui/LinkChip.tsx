"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Re-exporta os helpers puros para quem já importava daqui.
export { toHref, shortLabel } from "@/lib/links";

// Chip clicável compacto (ícone + rótulo curto) para redes e links.
// stopPropagation evita abrir a ficha quando o chip está dentro de um card
// clicável.
export function LinkChip({
  href,
  icon,
  children,
  className,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex max-w-[180px] items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-1 text-xs text-foreground transition-colors hover:border-accent/50 hover:text-accent",
        className,
      )}
    >
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="truncate">{children}</span>
    </a>
  );
}
