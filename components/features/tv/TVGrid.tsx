/**
 * TV Show Grid Component
 * Grid layout for displaying TV shows using MediaCard
 */

'use client';

import { MediaCard } from '@/components/features/media/MediaCard';
import type { TVShow } from '@/types/tv';

interface TVGridProps {
  tvShows: TVShow[];
  className?: string;
}

export function TVGrid({ tvShows, className = '' }: TVGridProps) {
  if (tvShows.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No TV shows found.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}
    >
      {tvShows.map((tvShow) => (
        <MediaCard key={tvShow.id} media={tvShow} />
      ))}
    </div>
  );
}
