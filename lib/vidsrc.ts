/**
 * VidSrc Content Info API (https://vidsrc.sh/vidsrc/docs/)
 *
 *   GET /info/movie/{id}.json
 *   GET /info/tv/{id}.json
 *   GET /info/tv/{id}/{season}/{episode}.json
 *
 * Returns 200 + JSON body when the title is available, or 404 + JSON body when it
 * isn't ("This title is not available.") — so availability can be read from the
 * status code alone. No API key required, CORS enabled.
 *
 * Also exposes the best available quality ('1080p' | '720p' | 'DVD' | 'SD' | 'CAM')
 * and the ready-to-embed URLs, which we surface in the player UI (quality badge) and
 * use to fail gracefully when a title/episode is missing. Responses are cached
 * server-side for ~5 minutes.
 */

import { VIDSRC_BASE_URL } from './constants';

export interface VidSrcSeasonInfo {
  season: number;
  episodes: number;
  first_episode: number;
  last_episode: number;
  quality: string;
}

export interface VidSrcInfoResponse {
  status_code: number;
  type: 'movie' | 'tv' | 'episode';
  imdb_id: string | null;
  tmdb_id: number | null;
  title?: string;
  show_title?: string;
  year?: number;
  quality?: string;
  poster?: string;
  imdb_rating?: number;
  embed_url?: string;
  embed_url_tmdb?: string;
  seasons?: VidSrcSeasonInfo[];
  total_episodes?: number;
  season?: number;
  episode?: number;
  time_added?: string;
}

/**
 * Availability resolution:
 *  - 'available'   → title/episode exists on VidSrc
 *  - 'unavailable' → 404, VidSrc does not have it
 *  - 'error'       → network/other failure; callers should fail open (show the player)
 */
export type VidsrcAvailability =
  | { status: 'available'; info: VidSrcInfoResponse }
  | { status: 'unavailable' }
  | { status: 'error' };

async function fetchInfo(path: string): Promise<VidsrcAvailability> {
  try {
    const res = await fetch(`${VIDSRC_BASE_URL}${path}`);
    if (res.status === 404) return { status: 'unavailable' };
    if (!res.ok) return { status: 'error' };
    const json = (await res.json()) as VidSrcInfoResponse;
    if (json.status_code !== 200) return { status: 'unavailable' };
    return { status: 'available', info: json };
  } catch {
    // Fail open: never let the availability check block playback.
    return { status: 'error' };
  }
}

export function getMovieInfo(tmdbId: number): Promise<VidsrcAvailability> {
  return fetchInfo(`/info/movie/${tmdbId}.json`);
}

export function getTVShowInfo(tmdbId: number): Promise<VidsrcAvailability> {
  return fetchInfo(`/info/tv/${tmdbId}.json`);
}

export function getEpisodeInfo(
  tmdbId: number,
  season: number,
  episode: number
): Promise<VidsrcAvailability> {
  return fetchInfo(`/info/tv/${tmdbId}/${season}/${episode}.json`);
}