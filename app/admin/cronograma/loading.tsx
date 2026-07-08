import { SkeletonHeader, SkeletonGrid } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader />
      <SkeletonGrid />
    </div>
  );
}
