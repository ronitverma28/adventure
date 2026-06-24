import { cn } from '@/lib/utils/cn';

interface TrekCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function TrekCardSkeleton({ viewMode = 'grid' }: TrekCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-40 w-48 shrink-0 animate-pulse bg-muted sm:w-64" />
        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-7 w-28 animate-pulse rounded-lg bg-muted" />
            <div className="flex gap-2">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Image skeleton */}
      <div className="relative h-56 animate-pulse bg-muted">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Location */}
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        {/* Title */}
        <div className="h-5 w-4/5 animate-pulse rounded-lg bg-muted" />
        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
        </div>
        {/* Chips */}
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
        </div>
        {/* Footer */}
        <div className="flex items-end justify-between border-t border-border pt-4">
          <div className="space-y-1">
            <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrekGridSkeleton({ count = 12, viewMode = 'grid' }: { count?: number; viewMode?: 'grid' | 'list' }) {
  return (
    <div
      className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-4'
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <TrekCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
