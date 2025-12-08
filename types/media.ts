/**
 * Unified Media Type Definitions
 *
 * Shared types for both movies and TV shows, enabling a unified
 * interface for favorites, watch history, and continue watching.
 */

import type { Movie } from './movie';
import type { TVShow } from './tv';

export type MediaType = 'movie' | 'tv';

export type Media = Movie | TVShow;

/**
 * Favorite Item
 * Represents a user's favorited movie or TV show
 */
export interface FavoriteItem {
  id: number;
  type: MediaType;
  addedAt: string;
}

/**
 * Watch History Item
 * Tracks user's viewing history with progress
 */
export interface WatchHistoryItem {
  id: number;
  type: MediaType;
  timestamp: number;
  progress: number; // Percentage (0-100)
  lastWatched: string; // ISO date string

  // Movie-specific
  runtime?: number; // Total duration in minutes

  // TV-specific
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

/**
 * Continue Watching Item
 * Represents media that user has started but not completed
 */
export interface ContinueWatchingItem {
  id: number;
  type: MediaType;
  progress: number; // Percentage (0-100)
  lastWatched: string; // ISO date string

  // Movie-specific
  title?: string;
  posterPath?: string;
  runtime?: number;

  // TV-specific
  name?: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  nextEpisode?: {
    season: number;
    episode: number;
  };
}

/**
 * Type guard to check if media is a Movie
 * Handles both camelCase (transformed) and snake_case (API) properties
 */
export function isMovie(media: Media): media is Movie {
  return 'title' in media && ('releaseDate' in media || 'release_date' in media);
}

/**
 * Type guard to check if media is a TV Show
 */
export function isTVShow(media: Media): media is TVShow {
  return 'name' in media && 'first_air_date' in media && 'number_of_seasons' in media;
}

/**
 * Get media title (works for both movies and TV shows)
 */
export function getMediaTitle(media: Media): string {
  return isMovie(media) ? media.title : media.name;
}

/**
 * Get media release date (works for both movies and TV shows)
 */
export function getMediaReleaseDate(media: Media): string {
  if (isMovie(media)) {
    return media.releaseDate || media.release_date || '';
  }
  return media.first_air_date || '';
}

/**
 * Get media poster path (works for both movies and TV shows)
 */
export function getMediaPosterPath(media: Media): string | null {
  if (isMovie(media)) {
    return media.posterPath || media.poster_path || null;
  }
  return media.poster_path || null;
}

/**
 * Get media backdrop path (works for both movies and TV shows)
 */
export function getMediaBackdropPath(media: Media): string | null {
  if (isMovie(media)) {
    return media.backdropPath || media.backdrop_path || null;
  }
  return media.backdrop_path || null;
}

/**
 * Multi-search result (movies + TV shows)
 */
export interface MultiSearchResult {
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}
