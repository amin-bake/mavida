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
//
// Official VidSrc API docs: https://vidsrc.sh/vidsrc/docs/
// All official VidSrc domains serve identical content. vidsrc.sh is the canonical,
// currently-live domain — vidsrcme.su / vsrc.su stopped resolving after the API redesign.
//
// Override with NEXT_PUBLIC_VIDSRC_BASE_URL to point at a CUSTOM DOMAIN
// (see docs: DNS CNAME → vidsrc-ip.com + Cloudflare SSL Flexible). Custom domains unlock
// true no-click autoplay (autoplay=1) — official domains always show a play button first.
export const VIDSRC_BASE_URL =
  process.env.NEXT_PUBLIC_VIDSRC_BASE_URL?.replace(/\/+$/, '') || 'https://vidsrc.sh';

export const STREAMING_SOURCES = {
  primary: `${VIDSRC_BASE_URL}/embed/movie`,
} as const;

// Video streaming utilities
//
// VidSrc embed URL formats (https://vidsrc.sh/vidsrc/docs/):
//   Movie: /embed/movie?tmdb={id}          (path form: /embed/movie/{tmdbId | imdbId})
//   TV:    /embed/tv?tmdb={id}&season=N&episode=M
//
// Query parameters:
//   autoplay  — 0/1. On official domains the player ALWAYS shows a play button first;
//               this param only controls whether playback starts automatically after
//               that click. Browsers may block unmuted autoplay (falls back to muted
//               with an unmute prompt).
//   autonext  — TV only. 0/1. Shows an "Up next" countdown and auto-plays the next
//               episode when the current one ends. Works on specific-episode URLs.
//   startAt   — Resume: start playback at this timestamp (seconds).
//
// The player postMessages { type: 'PLAYER_EVENT', data: { player_info,
// player_status, player_progress, player_duration } } so the parent page can track
// progress (~every 5s while playing) and detect VidSrc's native autonext transitions
// via player_info.season/episode, then sync the browser URL with replaceState
// (no iframe remount needed).

export interface MovieEmbedOptions {
  autoplay?: boolean; // default true
  startAtSeconds?: number;
}

export interface TVEmbedOptions extends MovieEmbedOptions {
  autonext?: boolean; // default false
}

export const getMovieEmbedUrl = (tmdbId: number, options: MovieEmbedOptions = {}): string => {
  const autoplay = options.autoplay !== false;
  const params = [`tmdb=${tmdbId}`, `autoplay=${autoplay ? '1' : '0'}`];
  if (options.startAtSeconds) params.push(`startAt=${Math.floor(options.startAtSeconds)}`);
  return `${VIDSRC_BASE_URL}/embed/movie?${params.join('&')}`;
};

export const getTVEmbedUrl = (
  tmdbId: number,
  season: number,
  episode: number,
  options: TVEmbedOptions = {}
): string => {
  const autoplay = options.autoplay !== false;
  const params = [
    `tmdb=${tmdbId}`,
    `season=${season}`,
    `episode=${episode}`,
    `autoplay=${autoplay ? '1' : '0'}`,
  ];
  if (options.autonext) params.push('autonext=1');
  if (options.startAtSeconds) params.push(`startAt=${Math.floor(options.startAtSeconds)}`);
  return `${VIDSRC_BASE_URL}/embed/tv?${params.join('&')}`;
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

// Server-side revalidation window (seconds) for TMDB-backed pages (homepage hero +
// rows). The homepage is regenerated server-side at least this often, so newly
// released titles surface within this window. Raise to 86_400 for a daily refresh.
export const TMDB_SERVER_REVALIDATE_SECONDS = 60 * 60; // 1 hour

// Debounce Times
export const DEBOUNCE_TIMES = {
  search: 300, // 300ms
  scroll: 100, // 100ms
} as const;
