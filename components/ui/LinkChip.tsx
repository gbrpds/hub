import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Normaliza um valor para href clicável.
export function toHref(kind: "instagram" | "url" | "phone", value: string) {
  const v = value.trim();
  if (kind === "instagram") {
    const handle = v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
    return `https://instagram.com/${handle}`;
  }
  if (kind === "phone") return `tel:${v.replace(/[^0-9+]/g, "")}`;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

// Rótulo curto/reduzido do link (ex.: @usuario, domínio).
export function shortLabel(kind: "instagram" | "url" | "phone", value: string) {
  const v = value.trim();
  if (kind === "instagram") return `@${v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")}`;
  if (kind === "phone") return v;
  try {
    return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).host.replace(/^www\./, "");
  } catch {
    return v;
  }
}

// Chip clicável compacto (ícone + rótulo curto) para redes e links.
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
