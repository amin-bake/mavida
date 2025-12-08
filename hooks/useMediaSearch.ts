/**
 * Unified Search Hook
 * Searches both movies and TV shows based on mediaType filter
 */

'use client';

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useSearchStore } from '@/stores/searchStore';
import { searchMovies, searchTVShows } from '@/services/tmdb';
import { CACHE_TIMES } from '@/lib/constants';
import type { Movie, MoviesPage, TMDBSearchParams } from '@/types/movie';
import type { TVShow } from '@/types/tv';
import type { MediaType } from '@/types/media';

/**
 * Unified media search result
 */
export interface MediaSearchResult {
  movies: Movie[];
  tvShows: TVShow[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Hook to search across movies and TV shows based on current filter
 */
export function useMediaSearch(
  query: string,
  params: Partial<TMDBSearchParams> = {},
  options?: Omit<UseQueryOptions<MediaSearchResult>, 'queryKey' | 'queryFn'>
): UseQueryResult<MediaSearchResult> {
  const { mediaType } = useSearchStore();
  const page = params.page || 1;

  return useQuery({
    queryKey: ['media', 'search', query, mediaType, page, params],
    queryFn: async () => {
      // Search based on media type filter
      if (mediaType === 'movie') {
        const moviesData = await searchMovies(query, params);
        return {
          movies: moviesData.movies,
          tvShows: [],
          totalResults: moviesData.totalResults,
          totalPages: moviesData.totalPages,
          currentPage: moviesData.page,
        };
      } else if (mediaType === 'tv') {
        const tvData = await searchTVShows(query, params);
        return {
          movies: [],
          tvShows: tvData.tvShows,
          totalResults: tvData.totalResults,
          totalPages: tvData.totalPages,
          currentPage: tvData.page,
        };
      } else {
        // 'all' - search both
        const [moviesData, tvData] = await Promise.all([
          searchMovies(query, params),
          searchTVShows(query, params),
        ]);

        return {
          movies: moviesData.movies,
          tvShows: tvData.tvShows,
          totalResults: moviesData.totalResults + tvData.totalResults,
          totalPages: Math.max(moviesData.totalPages, tvData.totalPages),
          currentPage: page,
        };
      }
    },
    staleTime: CACHE_TIMES.search,
    enabled: query.length > 0,
    ...options,
  });
}

/**
 * Type guard to check if media is a TV show
 */
export function isTVShow(media: Movie | TVShow): media is TVShow {
  return 'name' in media && 'first_air_date' in media;
}

/**
 * Type guard to check if media is a Movie
 */
export function isMovie(media: Movie | TVShow): media is Movie {
  return 'title' in media && 'release_date' in media;
}

/**
 * Get media type from media object
 */
export function getMediaType(media: Movie | TVShow): MediaType {
  return isTVShow(media) ? 'tv' : 'movie';
}

/**
 * Get media title (works for both movies and TV shows)
 */
export function getMediaTitle(media: Movie | TVShow): string {
  return isTVShow(media) ? media.name : media.title;
}

/**
 * Get media year (works for both movies and TV shows)
 */
export function getMediaYear(media: Movie | TVShow): string {
  const date = isTVShow(media) ? media.first_air_date : media.release_date;
  return date ? new Date(date).getFullYear().toString() : 'N/A';
}

/**
 * Get media ID
 */
export function getMediaId(media: Movie | TVShow): number {
  return media.id;
}
