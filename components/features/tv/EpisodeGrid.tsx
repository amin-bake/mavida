/**
 * Episode Grid Component
 * Displays TV episodes in a responsive grid layout with loading and empty states
 */

'use client';

import { EpisodeCard } from './EpisodeCard';
import type { TVEpisode } from '@/types/tv';

interface EpisodeGridProps {
  episodes: TVEpisode[];
  tvShowId: number;
  seasonNumber: number;
  className?: string;
  progressMap?: Record<number, number>; // Map of episode number to progress percentage
  isLoading?: boolean;
}

/**
 * Episode Card Skeleton Loader
 */
function EpisodeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md bg-card animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Thumbnail Skeleton */}
        <div className="relative w-full sm:w-52 flex-none aspect-video rounded-md bg-muted" />

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-5 w-3/4 bg-muted rounded" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
            <div className="h-3 w-4/6 bg-muted rounded sm:hidden" />
          </div>

          {/* Metadata */}
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ message = 'No episodes available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-24 w-24 mb-6 rounded-full flex items-center justify-center ">
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        This season doesn't have any episodes yet, or the data is unavailable.
      </p>
    </div>
  );
}

/**
 * Episode Grid Component
 */
export function EpisodeGrid({
  episodes,
  tvShowId,
  seasonNumber,
  className = '',
  progressMap,
  isLoading = false,
}: EpisodeGridProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <EpisodeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (episodes.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  // Sort episodes by episode number
  const sortedEpisodes = [...episodes].sort((a, b) => a.episode_number - b.episode_number);

  return (
    <div className={`space-y-4 ${className}`}>
      {sortedEpisodes.map((episode, index) => {
        const progress = progressMap?.[episode.episode_number];

        return (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            tvShowId={tvShowId}
            seasonNumber={seasonNumber}
            progress={progress}
            priority={index < 3} // Prioritize first 3 episodes
          />
        );
      })}
    </div>
  );
}
