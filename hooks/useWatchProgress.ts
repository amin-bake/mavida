/**
 * Watch Progress Hook
 * Tracks playback progress for movies and TV shows
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useUserPreferencesStore } from '@/stores';
import type { MediaType } from '@/types/media';

interface UseWatchProgressOptions {
  id: number;
  type: MediaType;
  // TV-specific
  season?: number;
  episode?: number;
  episodeTitle?: string;
  // Optional metadata
  title?: string;
  posterPath?: string;
  runtime?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
}

interface UseWatchProgressReturn {
  updateProgress: (currentTime: number, duration: number) => void;
  markComplete: () => void;
  saveProgress: (progress: number) => void;
}

/**
 * Hook to track and save watch progress
 * - Automatically saves progress every 10 seconds
 * - Marks as complete when 90% watched
 * - Handles both movies and TV shows
 * - Updates continue watching list
 */
export function useWatchProgress(options: UseWatchProgressOptions): UseWatchProgressReturn {
  const { id, type, season, episode, episodeTitle, title, posterPath, runtime } = options;
  const { updateWatchHistoryItem, updateContinueWatching } = useUserPreferencesStore();

  const lastSaveTimeRef = useRef<number>(0);
  const saveIntervalMs = 10000; // Save every 10 seconds

  /**
   * Update watch progress
   * @param currentTime - Current playback time in seconds
   * @param duration - Total duration in seconds
   */
  const updateProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (duration === 0) return;

      const progress = Math.min((currentTime / duration) * 100, 100);
      const now = Date.now();

      // Only save if 10 seconds have passed since last save
      if (now - lastSaveTimeRef.current >= saveIntervalMs) {
        saveProgress(progress);
        lastSaveTimeRef.current = now;
      }
    },
    [id, type, season, episode]
  );

  /**
   * Save progress to store
   */
  const saveProgress = useCallback(
    (progress: number) => {
      // Update watch history
      updateWatchHistoryItem(id, type, progress, season, episode);

      // Update continue watching
      if (type === 'movie') {
        updateContinueWatching({
          id,
          type: 'movie',
          progress,
          lastWatched: new Date().toISOString(),
          title,
          posterPath,
          runtime,
        });
      } else {
        // For TV shows, calculate next episode
        const nextEpisode = calculateNextEpisode(
          season!,
          episode!,
          options.totalSeasons,
          options.totalEpisodes
        );

        updateContinueWatching({
          id,
          type: 'tv',
          progress,
          lastWatched: new Date().toISOString(),
          name: title,
          season,
          episode,
          episodeTitle,
          nextEpisode,
        });
      }
    },
    [id, type, season, episode, episodeTitle, title, posterPath, runtime]
  );

  /**
   * Mark media as complete (90%+ watched)
   * Removes from continue watching
   */
  const markComplete = useCallback(() => {
    saveProgress(100);
  }, [saveProgress]);

  return {
    updateProgress,
    markComplete,
    saveProgress,
  };
}

/**
 * Calculate next episode
 * Handles season boundaries
 */
function calculateNextEpisode(
  currentSeason: number,
  currentEpisode: number,
  totalSeasons?: number,
  episodesInSeason?: number
): { season: number; episode: number } | undefined {
  if (!episodesInSeason) return undefined;

  // If not last episode of season, return next episode
  if (currentEpisode < episodesInSeason) {
    return {
      season: currentSeason,
      episode: currentEpisode + 1,
    };
  }

  // If last episode of season but not last season, return first episode of next season
  if (totalSeasons && currentSeason < totalSeasons) {
    return {
      season: currentSeason + 1,
      episode: 1,
    };
  }

  // Series finale - no next episode
  return undefined;
}
