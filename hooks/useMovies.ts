/**
 * Custom TanStack Query Hooks for Movies
 * Provides type-safe, cacheable data fetching for movie-related queries
 */

'use client';

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getMovieDetails,
  getSimilarMovies,
  getMovieRecommendations,
  searchMovies,
  discoverMovies,
} from '@/services/tmdb';
import { movieKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/lib/constants';
import type { MoviesPage, MovieDetail, TMDBSearchParams, TMDBQueryParams } from '@/types/movie';

/**
 * Hook to fetch trending movies
 */
export function useTrendingMovies(
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.trending(timeWindow, page),
    queryFn: () => getTrendingMovies(timeWindow, page),
    staleTime: CACHE_TIMES.trending,
    ...options,
  });
}

/**
 * Hook to fetch popular movies
 */
export function usePopularMovies(
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.popular(page),
    queryFn: () => getPopularMovies(page),
    staleTime: CACHE_TIMES.popular,
    ...options,
  });
}

/**
 * Hook to fetch top rated movies
 */
export function useTopRatedMovies(
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.topRated(page),
    queryFn: () => getTopRatedMovies(page),
    staleTime: CACHE_TIMES.popular,
    ...options,
  });
}

/**
 * Hook to fetch now playing movies
 */
export function useNowPlayingMovies(
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.nowPlaying(page),
    queryFn: () => getNowPlayingMovies(page),
    staleTime: CACHE_TIMES.popular,
    ...options,
  });
}

/**
 * Hook to fetch upcoming movies
 */
export function useUpcomingMovies(
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.upcoming(page),
    queryFn: () => getUpcomingMovies(page),
    staleTime: CACHE_TIMES.popular,
    ...options,
  });
}

/**
 * Hook to fetch movie details
 */
export function useMovieDetail(
  movieId: number,
  options?: Omit<UseQueryOptions<MovieDetail>, 'queryKey' | 'queryFn'>
): UseQueryResult<MovieDetail> {
  return useQuery({
    queryKey: movieKeys.detail(movieId),
    queryFn: () => getMovieDetails(movieId),
    staleTime: CACHE_TIMES.movieDetail,
    enabled: !!movieId, // Only fetch if movieId is provided
    ...options,
  });
}

/**
 * Hook to fetch similar movies
 */
export function useSimilarMovies(
  movieId: number,
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.similar(movieId, page),
    queryFn: () => getSimilarMovies(movieId, page),
    staleTime: CACHE_TIMES.movieDetail,
    enabled: !!movieId,
    ...options,
  });
}

/**
 * Hook to fetch movie recommendations
 */
export function useMovieRecommendations(
  movieId: number,
  page: number = 1,
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  return useQuery({
    queryKey: movieKeys.recommendations(movieId, page),
    queryFn: () => getMovieRecommendations(movieId, page),
    staleTime: CACHE_TIMES.movieDetail,
    enabled: !!movieId,
    ...options,
  });
}

/**
 * Hook to search movies
 */
export function useSearchMovies(
  query: string,
  params: Partial<TMDBSearchParams> = {},
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  const page = params.page || 1;

  return useQuery({
    queryKey: movieKeys.search(query, page, params),
    queryFn: () => searchMovies(query, params),
    staleTime: CACHE_TIMES.search,
    enabled: query.length > 0, // Only search if query is not empty
    ...options,
  });
}

/**
 * Hook to discover movies with filters
 */
export function useDiscoverMovies(
  filters: TMDBQueryParams = {},
  options?: Omit<UseQueryOptions<MoviesPage>, 'queryKey' | 'queryFn'>
): UseQueryResult<MoviesPage> {
  const page = filters.page || 1;

  return useQuery({
    queryKey: movieKeys.discover(filters as Record<string, unknown>, page),
    queryFn: () => discoverMovies(filters),
    staleTime: CACHE_TIMES.popular,
    ...options,
  });
}

/**
 * Hook to prefetch movie details
 * Useful for optimistic navigation (e.g., on hover)
 */
export function usePrefetchMovieDetail(movieId: number): void {
  const queryClient = useQuery({
    queryKey: movieKeys.detail(movieId),
    queryFn: () => getMovieDetails(movieId),
    staleTime: CACHE_TIMES.movieDetail,
    enabled: false, // Don't fetch immediately
  });

  // This hook is used for prefetching only
  // The actual data fetching happens in the detail page
}
