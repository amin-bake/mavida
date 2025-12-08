/**
 * Custom Hooks Barrel Export
 */

export * from './useMovies';
export * from './useMediaSearch';
export * from './useDebounce';
export * from './useContinueWatching';
export * from './useEnhancedContinueWatching';
export * from './useWatchProgress';

// Re-export TV hooks from TMDB service
export {
  useTrendingTV,
  usePopularTV,
  useTopRatedTV,
  useAiringTodayTV,
  useOnTheAirTV,
  useTVShow,
  useTVSeason,
  useTVEpisode,
  useTVCredits,
  useTVVideos,
  useSimilarTV,
  useTVRecommendations,
} from '@/services/tmdb/tv.queries';
