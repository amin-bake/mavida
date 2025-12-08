/**
 * Movie Card Component (Legacy)
 * @deprecated Use MediaCard from @/components/features/media/MediaCard instead
 * This component is kept for backward compatibility only
 */

'use client';

import { MediaCard } from '../media/MediaCard';
import type { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  priority?: boolean;
  progress?: number;
  asChild?: boolean;
}

/**
 * @deprecated Use MediaCard instead. This is a compatibility wrapper.
 */
export function MovieCard({
  movie,
  className = '',
  priority = false,
  progress,
  asChild = false,
}: MovieCardProps) {
  return (
    <MediaCard
      media={movie}
      className={className}
      priority={priority}
      progress={progress}
      asChild={asChild}
    />
  );
}
