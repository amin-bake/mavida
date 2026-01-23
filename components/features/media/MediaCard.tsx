/**
 * Media Card Component
 * Displays a movie or TV show poster with hover effects, favorite button, and prefetching
 * Unified component for both movies and TV shows
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { getPosterUrl } from '@/lib/tmdb/images';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { queryKeys } from '@/lib/queryKeys';
import { getMovieDetails } from '@/services/tmdb';
import { getTMDBClient } from '@/services/tmdb/client';
import { useToast } from '@/contexts/ToastContext';
import type { Media } from '@/types/media';
import {
  isMovie,
  isTVShow,
  getMediaTitle,
  getMediaReleaseDate,
  getMediaPosterPath,
} from '@/types/media';

interface MediaCardProps {
  media: Media;
  className?: string;
  priority?: boolean; // For above-the-fold images
  progress?: number; // Watch progress (0-100) for Continue Watching
  season?: number; // For TV shows in Continue Watching
  episode?: number; // For TV shows in Continue Watching
  asChild?: boolean; // If true, renders without Link wrapper (parent handles navigation)
}

export function MediaCard({
  media,
  className = '',
  priority = false,
  progress,
  season,
  episode,
  asChild = false,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Handle both camelCase (Movie) and snake_case (TVShow) properties
  const posterPath = getMediaPosterPath(media);
  const posterUrl = posterPath ? getPosterUrl(posterPath, 'lg') : null;
  const title = getMediaTitle(media);
  const releaseDate = getMediaReleaseDate(media);
  const mediaType = isMovie(media) ? 'movie' : 'tv';

  // Get rating - handle both naming conventions
  const rating = isMovie(media) ? media.rating || media.vote_average || 0 : media.vote_average || 0;

  const { isFavoriteItem, toggleFavoriteItem } = useUserPreferencesStore();
  const isMediaFavorite = isFavoriteItem(media.id, mediaType);

  // Determine link href based on media type
  const href = isMovie(media)
    ? `/movie/${media.id}`
    : season !== undefined && episode !== undefined
      ? `/tv/${media.id}/watch/${season}/${episode}` // Resume watching TV show
      : `/tv/${media.id}`; // Browse TV show

  // Prefetch media details on hover
  const handlePrefetch = () => {
    if (isMovie(media)) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.movies.detail(media.id),
        queryFn: () => getMovieDetails(media.id),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
      });
    } else if (isTVShow(media)) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.tv.detail(media.id),
        queryFn: () => getTMDBClient().getTVShow(media.id),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
      });
    }
  };

  // Handle favorite toggle
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteItem(media.id, mediaType);

    // Show toast notification
    if (isMediaFavorite) {
      toast.info('Removed from My List', `${title} has been removed from your list`);
    } else {
      toast.success('Added to My List', `${title} has been added to your list`);
    }
  };

  // Get additional info for display
  const getAdditionalInfo = () => {
    if (isMovie(media)) {
      return releaseDate ? new Date(releaseDate).getFullYear() : null;
    } else if (isTVShow(media)) {
      const seasons = media.number_of_seasons;
      return seasons ? `${seasons} Season${seasons > 1 ? 's' : ''}` : null;
    }
    return null;
  };

  const additionalInfo = getAdditionalInfo();

  const cardContent = (
    <div
      className={`group relative block overflow-hidden rounded-md bg-card transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background content-visibility-auto contain-intrinsic-size-[0_280px] ${className}`}
      onMouseEnter={handlePrefetch}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 z-10 p-2.5 min-h-11 min-w-11 rounded-full bg-black/70 backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-black/90 hover:scale-110 shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={isMediaFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className={`h-5 w-5 transition-colors ${
            isMediaFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-white'
          }`}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Media Type Badge - shown for TV shows */}
      {isTVShow(media) && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wide shadow-lg">
          TV
        </div>
      )}

      {/* Season/Episode Badge - shown for Continue Watching TV shows */}
      {isTVShow(media) && season !== undefined && episode !== undefined && (
        <div className="absolute top-14 left-3 z-10 px-3 py-1.5 rounded-full bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold shadow-lg">
          S{season} E{episode}
        </div>
      )}

      {/* Poster Image */}
      <div className="relative aspect-2/3 w-full">
        {/* Progress Bar - shown when progress is provided */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-2 bg-black/80 backdrop-blur-sm">
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

        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjwvc3ZnPg=="
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-card">
            <svg
              className="h-16 w-16 text-muted-foreground"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-bold text-white text-lg line-clamp-2 mb-3">{title}</h3>
            <div className="flex items-center gap-x-4 text-sm text-gray-300">
              {additionalInfo && <span>{additionalInfo}</span>}
              {rating > 0 && (
                <div className="flex items-center gap-x-1">
                  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Title (visible on mobile when not hovering) */}
      <div className="p-4 md:hidden">
        <h3 className="font-semibold text-foreground text-base line-clamp-2">{title}</h3>
        {additionalInfo && <p className="text-sm text-muted-foreground mt-2">{additionalInfo}</p>}
      </div>
    </div>
  );

  // If asChild, return just the content (parent handles link)
  if (asChild) {
    return cardContent;
  }

  // Otherwise wrap in Link
  return (
    <Link href={href} aria-label={`View details for ${title}`}>
      {cardContent}
    </Link>
  );
}
