import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";

type Tone = "default" | "accent" | "success" | "danger";

const toneBox: Record<Tone, string> = {
  default: "border-border bg-surface-hover text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

const toneValue: Record<Tone, string> = {
  default: "text-foreground",
  accent: "text-accent",
  success: "text-success",
  danger: "text-danger",
};

// Cartão de indicador com ícone à esquerda e número em destaque (com contagem
// animada). Usado nos topos de página (Clientes, Dashboard, Financeiro).
export function StatCard({
  label,
  value,
  icon,
  format = "integer",
  tone = "default",
  hint,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  format?: "integer" | "currency";
  tone?: Tone;
  hint?: string;
}) {
  return (
    <Card glow={tone === "accent"} className="overflow-hidden">
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-colors duration-200",
            toneBox[tone],
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
              toneValue[tone],
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
