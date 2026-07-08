import { cn } from "@/lib/utils";

export function Avatar({
  name,
  photoUrl,
  size = 40,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn(
          "shrink-0 rounded-sm border border-border object-cover",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-sm border border-border bg-surface-hover font-bold text-muted",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
