/**
 * TV Grid Skeleton Component
 * Loading skeleton for TV show grid
 */

'use client';

interface TVGridSkeletonProps {
  count?: number;
}

export function TVGridSkeleton({ count = 20 }: TVGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`tv-skeleton-${index}`}
          className="aspect-2/3 animate-pulse rounded-md bg-muted"
        />
      ))}
    </div>
  );
}
