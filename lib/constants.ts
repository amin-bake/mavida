/**
 * Application-wide constants
 */

export const APP_NAME = 'Mavida';
export const APP_DESCRIPTION = 'Netflix-inspired movie streaming application';

// API Configuration
export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Image Sizes
export const TMDB_IMAGE_SIZES = {
  poster: {
    xs: 'w92',
    sm: 'w154',
    md: 'w185',
    lg: 'w342',
    xl: 'w500',
    '2xl': 'w780',
    original: 'original',
  },
  backdrop: {
    sm: 'w300',
    md: 'w780',
    lg: 'w1280',
    original: 'original',
  },
  profile: {
    sm: 'w45',
    md: 'w185',
    lg: 'h632',
    original: 'original',
  },
} as const;

// Video Streaming
export const STREAMING_SOURCES = {
  primary: 'https://vidsrc.me/embed/movie',
  fallback: 'https://vidsrc.xyz/embed/movie',
} as const;

// Pagination
export const ITEMS_PER_PAGE = 20;
export const MOVIES_PER_ROW = 6;

// Cache Times (in milliseconds)
export const CACHE_TIMES = {
  default: 1000 * 60 * 5, // 5 minutes (default)
  trending: 1000 * 60 * 60, // 1 hour
  popular: 1000 * 60 * 60, // 1 hour
  movieDetail: 1000 * 60 * 60 * 24, // 24 hours
  search: 1000 * 60 * 5, // 5 minutes
} as const;

// Debounce Times
export const DEBOUNCE_TIMES = {
  search: 300, // 300ms
  scroll: 100, // 100ms
} as const;
