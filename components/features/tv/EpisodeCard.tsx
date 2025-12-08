/**
 * Episode Card Component
 * Displays TV episode with thumbnail, metadata, and watch progress
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPosterUrl } from '@/lib/tmdb/images';
import type { TVEpisode } from '@/types/tv';

interface EpisodeCardProps {
  episode: TVEpisode;
  tvShowId: number;
  seasonNumber: number;
  progress?: number; // Watch progress (0-100)
  className?: string;
  priority?: boolean;
}

export function EpisodeCard({
  episode,
  tvShowId,
  seasonNumber,
  progress,
  className = '',
  priority = false,
}: EpisodeCardProps) {
  const [imageError, setImageError] = useState(false);

  // Use still_path for episode thumbnail (16:9 aspect ratio)
  const thumbnailUrl = episode.still_path ? getPosterUrl(episode.still_path, 'lg') : null;

  // Format runtime (minutes to "Xh Ym" or "Xm")
  const formatRuntime = (minutes: number | null | undefined) => {
    if (!minutes) return null;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const runtime = formatRuntime(episode.runtime);

  return (
    <Link
      href={`/tv/${tvShowId}/watch/${seasonNumber}/${episode.episode_number}`}
      className={`group relative block overflow-hidden rounded-md bg-card transition-all duration-200 ease-in-out hover:bg-card-hover hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
      aria-label={`Watch ${episode.name}`}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Episode Thumbnail - 16:9 aspect ratio */}
        <div className="relative w-full sm:w-52 flex-none aspect-video rounded-md overflow-hidden bg-muted">
          {/* Progress Bar Overlay */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 h-1.5 bg-black/80 backdrop-blur-sm">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${Math.round(progress)}% watched`}
              />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="h-14 w-14 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
              <svg className="h-6 w-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {thumbnailUrl && !imageError ? (
            <Image
              src={thumbnailUrl}
              alt={episode.name}
              fill
              sizes="(max-width: 640px) 100vw, 208px"
              className="object-cover"
              priority={priority}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjwvc3ZnPg=="
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center border border-white/10 rounded-md bg-muted-background">
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
          )}
        </div>

        {/* Episode Info */}
        <div className="flex-1 min-w-0">
          {/* Episode Number and Title */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-bold text-primary">
                Episode {episode.episode_number}
              </span>
              {runtime && <span className="text-xs text-muted-foreground">{runtime}</span>}
            </div>
            <h3 className="font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
              {episode.name}
            </h3>
          </div>

          {/* Episode Overview */}
          {episode.overview && (
            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
              {episode.overview}
            </p>
          )}

          {/* Episode Metadata */}
          {episode.air_date && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <svg
                className="h-4 w-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(episode.air_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
