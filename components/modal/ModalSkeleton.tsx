// Esqueleto genérico do corpo de um modal — aparece na hora enquanto os
// dados reais carregam (streaming via Suspense). Só transform/opacity.
export function ModalSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-4 w-24 rounded bg-surface-hover" />
        <div className="h-7 w-2/3 rounded bg-surface-hover" />
      </div>
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="h-3 w-20 rounded bg-surface-hover" />
            <div className="h-24 w-full rounded bg-surface-hover" />
            <div className="h-3 w-16 rounded bg-surface-hover" />
            <div className="h-16 w-full rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}
