/**
 * TV Show Card Component
 * Simple wrapper around MediaCard for TV shows
 */

'use client';

import { MediaCard } from '../media/MediaCard';
import type { TVShow } from '@/types/tv';

interface TVShowCardProps {
  tvShow: TVShow;
  className?: string;
  priority?: boolean;
  progress?: number;
  asChild?: boolean;
}

export function TVShowCard({
  tvShow,
  className = '',
  priority = false,
  progress,
  asChild = false,
}: TVShowCardProps) {
  return (
    <MediaCard
      media={tvShow}
      className={className}
      priority={priority}
      progress={progress}
      asChild={asChild}
    />
  );
}
