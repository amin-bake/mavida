/**
 * Continue Watching Hook
 * Fetches movie details for items in watch history
 */

'use client';

import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { getMovieDetails } from '@/services/tmdb';
import { movieKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/lib/constants';
import type { MovieDetail, Movie } from '@/types/movie';
import { useUserPreferencesStore } from '@/stores';

interface ContinueWatchingItem {
  movie: Movie;
  progress: number;
  timestamp: number;
}

interface UseContinueWatchingResult {
  items: ContinueWatchingItem[];
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Hook to fetch movies from watch history for Continue Watching row
 * - Filters out completed movies (progress >= 90%)
 * - Sorts by most recent first
 * - Limits to 20 items
 * - Fetches movie details in parallel using useQueries
 */
export function useContinueWatching(): UseContinueWatchingResult {
  const watchHistory = useUserPreferencesStore((state) => state.watchHistory);

  // Filter and sort watch history
  const incompleteMovies = watchHistory
    .filter((item) => item.progress < 90) // Only show incomplete movies
    .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
    .slice(0, 20); // Limit to 20 items

  // Fetch movie details for each item in parallel
  const queries = useQueries({
    queries: incompleteMovies.map((item) => ({
      queryKey: movieKeys.detail(item.movieId),
      queryFn: () => getMovieDetails(item.movieId),
      staleTime: CACHE_TIMES.movieDetail,
    })),
  });

  // Check loading state - all queries must be complete
  const isLoading = queries.some((query) => query.isLoading);

  // Check error state - any query has error
  const hasError = queries.some((query) => query.isError);

  // Combine movie details with watch progress
  const items: ContinueWatchingItem[] = queries
    .map((query, index) => {
      const watchItem = incompleteMovies[index];
      if (!query.data) return null;

      const movieDetail = query.data;

      // Transform MovieDetail to Movie for MovieCard
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
        movie,
        progress: watchItem.progress,
        timestamp: watchItem.timestamp,
      };
    })
    .filter((item): item is ContinueWatchingItem => item !== null);

  return {
    items,
    isLoading,
    hasError,
  };
}
