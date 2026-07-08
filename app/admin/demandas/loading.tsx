import { SkeletonHeader, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader />
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-72 shrink-0" />
        ))}
      </div>
    </div>
  );
}
