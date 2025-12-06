/**
 * Query Key Factory
 * Centralized query key management for consistent caching
 */

/**
 * Query key factory for movies
 * Provides type-safe, consistent query keys for all movie-related queries
 */
export const movieKeys = {
  // Base key for all movie queries
  all: ['movies'] as const,

  // Lists
  lists: () => [...movieKeys.all, 'list'] as const,

  // Trending movies
  trending: (timeWindow: 'day' | 'week' = 'week', page: number = 1) =>
    [...movieKeys.lists(), 'trending', timeWindow, page] as const,

  // Popular movies
  popular: (page: number = 1) => [...movieKeys.lists(), 'popular', page] as const,

  // Top rated movies
  topRated: (page: number = 1) => [...movieKeys.lists(), 'top-rated', page] as const,

  // Now playing movies
  nowPlaying: (page: number = 1) => [...movieKeys.lists(), 'now-playing', page] as const,

  // Upcoming movies
  upcoming: (page: number = 1) => [...movieKeys.lists(), 'upcoming', page] as const,

  // Details
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (movieId: number) => [...movieKeys.details(), movieId] as const,

  // Similar movies
  similar: (movieId: number, page: number = 1) =>
    [...movieKeys.all, 'similar', movieId, page] as const,

  // Recommendations
  recommendations: (movieId: number, page: number = 1) =>
    [...movieKeys.all, 'recommendations', movieId, page] as const,

  // Search
  search: (query: string, page: number = 1, filters?: Record<string, unknown>) =>
    [...movieKeys.all, 'search', query, page, filters] as const,

  // Discover
  discover: (filters?: Record<string, unknown>, page: number = 1) =>
    [...movieKeys.all, 'discover', filters, page] as const,
};

/**
 * Query key factory for genres
 */
export const genreKeys = {
  all: ['genres'] as const,
  list: () => [...genreKeys.all, 'list'] as const,
};

/**
 * Query key factory for user preferences
 */
export const userKeys = {
  all: ['user'] as const,
  favorites: () => [...userKeys.all, 'favorites'] as const,
  watchHistory: () => [...userKeys.all, 'watch-history'] as const,
  recentSearches: () => [...userKeys.all, 'recent-searches'] as const,
};

/**
 * Utility type to extract query key from factory function
 */
export type QueryKey<T extends (...args: any[]) => readonly unknown[]> = ReturnType<T>;
