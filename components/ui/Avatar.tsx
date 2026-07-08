import Image from "next/image";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL } from "@/lib/media";

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
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        sizes={`${size}px`}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
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
