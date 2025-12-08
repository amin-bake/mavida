/**
 * TV Shows React Query Hooks
 *
 * Custom hooks for fetching TV show data using TanStack Query
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getTMDBClient } from './client';
import type {
  TVShow,
  TVShowsPage,
  TVShowSearchResult,
  TVSeasonDetail,
  TVEpisodeDetail,
} from '@/types/tv';
import type { TMDBCredits, TMDBVideosResponse } from '@/types/movie';

/**
 * Transform TVShowSearchResult to TVShowsPage
 */
function transformTVShowResponse(response: {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}): TVShowsPage {
  return {
    page: response.page,
    tvShows: response.results,
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Fetch trending TV shows
 */
export function useTrendingTV(
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1
): UseQueryResult<TVShowsPage, Error> {
  return useQuery({
    queryKey: ['tv', 'trending', timeWindow, page],
    queryFn: async () => {
      const response = await getTMDBClient().getTrendingTV(timeWindow, page);
      return transformTVShowResponse(response);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch popular TV shows
 */
export function usePopularTV(page: number = 1): UseQueryResult<TVShowsPage, Error> {
  return useQuery({
    queryKey: ['tv', 'popular', page],
    queryFn: async () => {
      const response = await getTMDBClient().getPopularTV(page);
      return transformTVShowResponse(response);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch top rated TV shows
 */
export function useTopRatedTV(page: number = 1): UseQueryResult<TVShowsPage, Error> {
  return useQuery({
    queryKey: ['tv', 'top-rated', page],
    queryFn: async () => {
      const response = await getTMDBClient().getTopRatedTV(page);
      return transformTVShowResponse(response);
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Fetch TV shows airing today
 */
export function useAiringTodayTV(page: number = 1): UseQueryResult<TVShowsPage, Error> {
  return useQuery({
    queryKey: ['tv', 'airing-today', page],
    queryFn: async () => {
      const response = await getTMDBClient().getAiringTodayTV(page);
      return transformTVShowResponse(response);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch TV shows currently on the air
 */
export function useOnTheAirTV(page: number = 1): UseQueryResult<TVShowsPage, Error> {
  return useQuery({
    queryKey: ['tv', 'on-the-air', page],
    queryFn: async () => {
      const response = await getTMDBClient().getOnTheAirTV(page);
      return transformTVShowResponse(response);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch TV show details
 */
export function useTVShow(tvId: number): UseQueryResult<TVShow, Error> {
  return useQuery({
    queryKey: ['tv', 'detail', tvId],
    queryFn: () => getTMDBClient().getTVShow(tvId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0,
  });
}

/**
 * Fetch TV season details with episodes
 */
export function useTVSeason(
  tvId: number,
  seasonNumber: number
): UseQueryResult<TVSeasonDetail, Error> {
  return useQuery({
    queryKey: ['tv', 'season', tvId, seasonNumber],
    queryFn: () => getTMDBClient().getTVSeason(tvId, seasonNumber),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0 && seasonNumber >= 0,
  });
}

/**
 * Fetch TV episode details
 */
export function useTVEpisode(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
): UseQueryResult<TVEpisodeDetail, Error> {
  return useQuery({
    queryKey: ['tv', 'episode', tvId, seasonNumber, episodeNumber],
    queryFn: () => getTMDBClient().getTVEpisode(tvId, seasonNumber, episodeNumber),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0 && seasonNumber >= 0 && episodeNumber > 0,
  });
}

/**
 * Fetch TV show credits (cast and crew)
 */
export function useTVCredits(tvId: number): UseQueryResult<TMDBCredits, Error> {
  return useQuery({
    queryKey: ['tv', 'credits', tvId],
    queryFn: () => getTMDBClient().getTVCredits(tvId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0,
  });
}

/**
 * Fetch TV show videos (trailers, teasers, etc.)
 */
export function useTVVideos(tvId: number): UseQueryResult<TMDBVideosResponse, Error> {
  return useQuery({
    queryKey: ['tv', 'videos', tvId],
    queryFn: () => getTMDBClient().getTVVideos(tvId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0,
  });
}

/**
 * Fetch similar TV shows
 */
export function useSimilarTV(
  tvId: number,
  page: number = 1
): UseQueryResult<TVShowSearchResult, Error> {
  return useQuery({
    queryKey: ['tv', 'similar', tvId, page],
    queryFn: () => getTMDBClient().getSimilarTV(tvId, page),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0,
  });
}

/**
 * Fetch TV show recommendations
 */
export function useTVRecommendations(
  tvId: number,
  page: number = 1
): UseQueryResult<TVShowSearchResult, Error> {
  return useQuery({
    queryKey: ['tv', 'recommendations', tvId, page],
    queryFn: () => getTMDBClient().getTVRecommendations(tvId, page),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0,
  });
}

/**
 * Search TV shows
 */
export function useSearchTV(
  query: string,
  page: number = 1
): UseQueryResult<TVShowSearchResult, Error> {
  return useQuery({
    queryKey: ['tv', 'search', query, page],
    queryFn: () => getTMDBClient().searchTV(query, { page }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: query.length > 0,
  });
}

/**
 * Discover TV shows with filters
 */
export function useDiscoverTV(
  params: Record<string, any> = {},
  page: number = 1
): UseQueryResult<TVShowSearchResult, Error> {
  return useQuery({
    queryKey: ['tv', 'discover', params, page],
    queryFn: () => getTMDBClient().discoverTV({ ...params, page }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch full TV show information (details + credits + videos)
 */
export function useFullTVInfo(tvId: number): UseQueryResult<
  {
    details: TVShow;
    credits: TMDBCredits;
    videos: TMDBVideosResponse;
  },
  Error
> {
  return useQuery({
    queryKey: ['tv', 'full-info', tvId],
    queryFn: () => getTMDBClient().getFullTVInfo(tvId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: tvId > 0,
  });
}
