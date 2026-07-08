import { SkeletonHeader, Skeleton, SkeletonList } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader />
      <Skeleton className="h-20 w-full" />
      <SkeletonList />
    </div>
  );
}
