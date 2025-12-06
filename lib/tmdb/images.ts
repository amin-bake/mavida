/**
 * TMDB Image Utilities
 * Helper functions for constructing TMDB image URLs
 */

import { TMDB_IMAGE_BASE_URL, TMDB_IMAGE_SIZES } from '@/lib/constants';

/**
 * Image size type definitions
 */
export type PosterSize = keyof typeof TMDB_IMAGE_SIZES.poster;
export type BackdropSize = keyof typeof TMDB_IMAGE_SIZES.backdrop;
export type ProfileSize = keyof typeof TMDB_IMAGE_SIZES.profile;

/**
 * Get poster image URL
 */
export function getPosterUrl(path: string | null, size: PosterSize = 'md'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${TMDB_IMAGE_SIZES.poster[size]}${path}`;
}

/**
 * Get backdrop image URL
 */
export function getBackdropUrl(path: string | null, size: BackdropSize = 'lg'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${TMDB_IMAGE_SIZES.backdrop[size]}${path}`;
}

/**
 * Get profile image URL
 */
export function getProfileUrl(path: string | null, size: ProfileSize = 'md'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${TMDB_IMAGE_SIZES.profile[size]}${path}`;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(
  videoKey: string,
  quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'
): string {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoKey}/${qualityMap[quality]}.jpg`;
}

/**
 * Get responsive image srcset for posters
 */
export function getPosterSrcSet(path: string | null): string | null {
  if (!path) return null;

  const sizes: PosterSize[] = ['sm', 'md', 'lg', 'xl'];
  const widths = [154, 185, 342, 500];

  return sizes.map((size, i) => `${getPosterUrl(path, size)} ${widths[i]}w`).join(', ');
}

/**
 * Get responsive image srcset for backdrops
 */
export function getBackdropSrcSet(path: string | null): string | null {
  if (!path) return null;

  const sizes: BackdropSize[] = ['sm', 'md', 'lg'];
  const widths = [300, 780, 1280];

  return sizes.map((size, i) => `${getBackdropUrl(path, size)} ${widths[i]}w`).join(', ');
}

/**
 * Get placeholder image URL (for missing images)
 */
export function getPlaceholderImage(
  type: 'poster' | 'backdrop' | 'profile',
  width: number,
  height: number
): string {
  // Use a placeholder service or return a local placeholder
  return `https://via.placeholder.com/${width}x${height}/1a1a1a/666666?text=${type}`;
}
