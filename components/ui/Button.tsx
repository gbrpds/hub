import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "shine bg-gradient-accent text-accent-foreground shadow-[0_2px_10px_-3px_rgba(255,122,61,0.5)] hover:shadow-[0_10px_28px_-6px_rgba(255,122,61,0.7)] hover:brightness-105",
  secondary:
    "bg-surface text-foreground border border-border hover:border-accent/50 hover:bg-surface-hover hover:shadow-[0_6px_18px_-10px_rgba(255,122,61,0.4)]",
  outline:
    "bg-transparent text-foreground border border-border hover:border-accent hover:text-accent hover:shadow-[0_6px_18px_-10px_rgba(255,122,61,0.4)]",
  ghost: "bg-transparent text-foreground hover:bg-surface-hover hover:text-accent",
  danger:
    "bg-danger text-white hover:brightness-110 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.5)] hover:shadow-[0_10px_28px_-6px_rgba(239,68,68,0.6)]",
} as const;

const sizeClasses = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded font-semibold",
          "transition-all duration-200 ease-out will-change-transform",
          "hover:-translate-y-px hover:scale-[1.02] active:scale-[0.99]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
