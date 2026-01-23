/**
 * Enhanced Continue Watching Hook
 * Fetches both movies and TV shows from watch history
 */

'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getMovieDetails } from '@/services/tmdb';
import { getTMDBClient } from '@/services/tmdb/client';
import { movieKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/lib/constants';
import type { MovieDetail, Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';
import type { ContinueWatchingItem } from '@/types/media';
import { useUserPreferencesStore } from '@/stores';

interface ContinueWatchingResult {
  items: EnhancedContinueWatchingItem[];
  isLoading: boolean;
  hasError: boolean;
}

interface EnhancedContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  media: Movie | TVShow;
  progress: number;
  timestamp: number;
  // TV-specific
  season?: number;
  episode?: number;
  episodeTitle?: string;
  nextEpisode?: {
    season: number;
    episode: number;
  };
}

export type { EnhancedContinueWatchingItem };

/**
 * Hook to fetch media from continue watching list
 * - Supports both movies and TV shows
 * - Filters out completed items (progress >= 90%)
 * - Sorts by most recent first
 * - Limits to 20 items
 */
export function useEnhancedContinueWatching(): ContinueWatchingResult {
  const continueWatching = useUserPreferencesStore((state) => state.continueWatching);

  // Filter and sort - use useMemo for stable reference
  const incompleteItems = useMemo(() => {
    return continueWatching
      .filter((item) => item.progress < 90)
      .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
      .slice(0, 20);
  }, [continueWatching]);

  // Fetch details for all items (both movies and TV shows)
  const queries = useQueries({
    queries: incompleteItems.map((item) => ({
      queryKey: item.type === 'movie' ? movieKeys.detail(item.id) : ['tv', 'detail', item.id],
      queryFn: async () => {
        if (item.type === 'movie') {
          return getMovieDetails(item.id);
        } else {
          return getTMDBClient().getTVShow(item.id);
        }
      },
      staleTime: CACHE_TIMES.movieDetail,
      gcTime: CACHE_TIMES.movieDetail * 2,
      retry: 2,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    })),
  });

  const isLoading =
    incompleteItems.length > 0 && queries.some((q) => q.isLoading || q.isFetching || q.isPending);
  const hasError = queries.some((q) => q.isError);

  // Combine media details with watch progress
  const itemsWithNulls = queries.map((query, index): EnhancedContinueWatchingItem | null => {
    if (!query.data) return null;

    const watchItem = incompleteItems[index];
    const data = query.data;

    if (watchItem.type === 'movie') {
      const movieDetail = data as MovieDetail;
      const movie: Movie = {
        id: movieDetail.id,
        title: movieDetail.title,
        originalTitle: movieDetail.originalTitle,
        posterPath: movieDetail.posterPath,
        backdropPath: movieDetail.backdropPath,
        overview: movieDetail.overview,
        releaseDate: movieDetail.releaseDate,
        releaseYear: movieDetail.releaseYear,
        rating: movieDetail.rating,
        genres: movieDetail.genres,
        voteCount: movieDetail.voteCount,
        popularity: movieDetail.popularity,
        isAdult: movieDetail.isAdult,
        language: movieDetail.language,
      };

      return {
        id: watchItem.id,
        type: 'movie' as const,
        media: movie,
        progress: watchItem.progress,
        timestamp: new Date(watchItem.lastWatched).getTime(),
      };
    } else {
      const tvShow = data as TVShow;

      return {
        id: watchItem.id,
        type: 'tv' as const,
        media: tvShow,
        progress: watchItem.progress,
        timestamp: new Date(watchItem.lastWatched).getTime(),
        season: watchItem.season,
        episode: watchItem.episode,
        episodeTitle: watchItem.episodeTitle,
        nextEpisode: watchItem.nextEpisode,
      };
    }
  });

  const items = itemsWithNulls.filter(
    (item): item is EnhancedContinueWatchingItem => item !== null
  );

  return { items, isLoading, hasError };
}
