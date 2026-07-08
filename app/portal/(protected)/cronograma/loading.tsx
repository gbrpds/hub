import { SkeletonHeader, SkeletonCards, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonHeader />
      <SkeletonCards />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
