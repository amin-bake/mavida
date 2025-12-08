/**
 * Media Store
 * Manages playback state for both movies and TV shows
 */

import { create } from 'zustand';
import type { Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';
import type { MediaType } from '@/types/media';

interface MediaState {
  // Current media being watched
  currentMedia: Movie | TVShow | null;
  mediaType: MediaType | null;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // TV show specific state
  currentSeason?: number;
  currentEpisode?: number;

  // Actions
  setCurrentMedia: (media: Movie | TVShow, type: MediaType) => void;
  setEpisode: (season: number, episode: number) => void;
  setPlaybackState: (isPlaying: boolean) => void;
  updatePlaybackTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  clearMedia: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  // Initial state
  currentMedia: null,
  mediaType: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  currentSeason: undefined,
  currentEpisode: undefined,

  // Set current media (movie or TV show)
  setCurrentMedia: (media, type) => {
    set({
      currentMedia: media,
      mediaType: type,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      // Reset TV-specific state for movies
      currentSeason: type === 'movie' ? undefined : undefined,
      currentEpisode: type === 'movie' ? undefined : undefined,
    });
  },

  // Set current episode (TV shows only)
  setEpisode: (season, episode) => {
    set({
      currentSeason: season,
      currentEpisode: episode,
      currentTime: 0, // Reset playback time when changing episodes
    });
  },

  // Set playback state (playing/paused)
  setPlaybackState: (isPlaying) => {
    set({ isPlaying });
  },

  // Update current playback time
  updatePlaybackTime: (time) => {
    set({ currentTime: time });
  },

  // Set media duration
  setDuration: (duration) => {
    set({ duration });
  },

  // Set volume (0-1)
  setVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  },

  // Set muted state
  setMuted: (isMuted) => {
    set({ isMuted });
  },

  // Clear current media
  clearMedia: () => {
    set({
      currentMedia: null,
      mediaType: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentSeason: undefined,
      currentEpisode: undefined,
    });
  },
}));
