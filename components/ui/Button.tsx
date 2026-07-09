import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-accent text-accent-foreground hover:brightness-110 shadow-[0_0_0_0_rgba(255,90,31,0)] hover:shadow-[0_6px_20px_-6px_rgba(255,90,31,0.5)]",
  secondary:
    "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-surface-hover",
  outline:
    "bg-transparent text-foreground border border-border hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-foreground hover:bg-surface-hover",
  danger: "bg-danger text-white hover:brightness-110",
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
