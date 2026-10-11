/**
 * VidSrc availability hooks.
 * Wrap the Content Info endpoints (https://vidsrc.sh/vidsrc/docs/) in React Query so
 * the player can surface a quality badge and fail gracefully when a title/episode
 * isn't available on VidSrc.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getEpisodeInfo, getMovieInfo, getTVShowInfo } from '@/lib/vidsrc';
import { CACHE_TIMES } from '@/lib/constants';

const VIDSRC_QUERY_OPTIONS = {
  staleTime: CACHE_TIMES.default, // server caches info responses for ~5 min
  gcTime: CACHE_TIMES.default * 2,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

export function useMovieAvailability(tmdbId: number) {
  return useQuery({
    ...VIDSRC_QUERY_OPTIONS,
    queryKey: ['vidsrc-info', 'movie', tmdbId],
    queryFn: () => getMovieInfo(tmdbId),
  });
}

export function useTVShowAvailability(tmdbId: number) {
  return useQuery({
    ...VIDSRC_QUERY_OPTIONS,
    queryKey: ['vidsrc-info', 'tv', tmdbId],
    queryFn: () => getTVShowInfo(tmdbId),
  });
}

export function useEpisodeAvailability(tmdbId: number, season: number, episode: number) {
  return useQuery({
    ...VIDSRC_QUERY_OPTIONS,
    queryKey: ['vidsrc-info', 'tv', tmdbId, season, episode],
    queryFn: () => getEpisodeInfo(tmdbId, season, episode),
  });
}