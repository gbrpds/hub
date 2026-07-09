import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Número decorativo editorial (ex.: "01", "02"). */
  index?: string;
  title: string;
  description?: string;
  /** Ações à direita do cabeçalho (botões, filtros). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho de página no estilo editorial: número decorativo pequeno acima,
 * título grande e bold com glow radial laranja sutil atrás, descrição opcional.
 */
export function PageHeader({
  index,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow radial atrás do título — puramente decorativo. */}
      <div
        aria-hidden
        className="page-glow pointer-events-none absolute -inset-x-8 -top-16 h-48"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          {index && (
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {index}
            </span>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

/** Rótulo de seção com número decorativo — para blocos internos da página. */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      {index && (
        <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-accent">
          {index}
        </span>
      )}
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {children}
      </span>
    </div>
  );
}
