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
  primary: 'https://vidsrcme.su/embed/movie',
  fallback: 'https://vsrc.su/embed/movie',
} as const;

// Video streaming utilities
//
// VidSrc API docs: https://vidsrcme.ru/api/
//   autoplay: optional, 1 or 0. (Enabled by default — pass explicitly to be safe)
//   autonext: optional, 1 or 0. (Disabled by default — pass 1 to enable native autonext)
//
// Using VidSrc's native autonext=1 is correct: the episode transition happens inside
// the same iframe context so the browser's autoplay policy allows continued playback
// without requiring a new user gesture. The parent page detects episode changes via
// PLAYER_EVENT postMessages and updates React state accordingly.

export const getMovieEmbedUrl = (tmdbId: number, autoplay: boolean = true): string => {
  const autoplayParam = autoplay ? '&autoplay=1' : '&autoplay=0';
  return `https://vidsrcme.su/embed/movie?tmdb=${tmdbId}${autoplayParam}`;
};

export const getTVEmbedUrl = (
  tmdbId: number,
  season: number,
  episode: number,
  autoplay: boolean = true,
  autonext: boolean = false
): string => {
  const autoplayParam = autoplay ? '&autoplay=1' : '&autoplay=0';
  // autonext defaults to disabled in the API; only add the param when enabling it
  const autonextParam = autonext ? '&autonext=1' : '';
  return `https://vidsrcme.su/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}${autoplayParam}${autonextParam}`;
};

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
