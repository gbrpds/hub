import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";

// Cartão de indicador com ícone à esquerda e número em destaque (com contagem
// animada). Usado nos topos de página (Clientes, Dashboard).
export function StatCard({
  label,
  value,
  icon,
  format = "integer",
  accent = false,
  hint,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  format?: "integer" | "currency";
  accent?: boolean;
  hint?: string;
}) {
  return (
    <Card glow={accent} className="overflow-hidden">
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-colors duration-200",
            accent
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-border bg-surface-hover text-muted",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wide text-muted">
            {label}
          </p>
          <p
            className={cn(
              "mt-0.5 text-2xl font-bold tracking-tight",
              accent ? "text-accent" : "text-foreground",
            )}
          >
            <CountUp value={value} format={format} />
          </p>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
