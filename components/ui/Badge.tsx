import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-surface text-foreground border border-border",
  accent: "bg-accent/15 text-accent border border-accent/40",
  success: "bg-success/15 text-success border border-success/30",
  danger: "bg-danger/15 text-danger border border-danger/30",
  outline: "bg-transparent text-muted border border-border",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClasses;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        "transition-colors duration-200 ease-out",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
