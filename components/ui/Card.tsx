import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  glow = false,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded border border-border bg-surface",
        "transition-all duration-200 ease-out",
        "hover:border-border-strong hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]",
        glow && "hover:border-accent/40",
        className,
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden
          className="card-glow pointer-events-none absolute inset-x-0 top-0 h-24 rounded"
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 border-b border-border p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border p-6",
        className,
      )}
      {...props}
    />
  );
}
