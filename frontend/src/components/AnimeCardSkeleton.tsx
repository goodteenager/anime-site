export function AnimeCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-bg-card">
      <div className="aspect-[3/4] w-full bg-bg-hover" />
      <div className="p-3">
        <div className="h-4 w-3/4 rounded-full bg-bg-hover" />
        <div className="mt-2 h-3 w-1/2 rounded-full bg-bg-hover" />
      </div>
    </div>
  );
}

export function AnimeGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="anime-grid">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
