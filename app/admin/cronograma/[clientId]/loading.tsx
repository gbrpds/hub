import { Skeleton, SkeletonCards } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-64" />
      <SkeletonCards />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
