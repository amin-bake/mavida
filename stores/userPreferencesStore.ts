/**
 * User Preferences Store
 * Manages user favorites and watch history
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie } from '@/types/movie';

interface WatchProgress {
  movieId: number;
  progress: number; // 0-100 percentage
  timestamp: number;
  title: string;
  posterPath: string | null;
}

interface UserPreferencesState {
  // Favorites
  favorites: Movie[];

  // Watch history with progress
  watchHistory: WatchProgress[];

  // Actions - Favorites
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  toggleFavorite: (movie: Movie) => void;

  // Actions - Watch History
  updateWatchProgress: (
    movieId: number,
    progress: number,
    title: string,
    posterPath: string | null
  ) => void;
  getWatchProgress: (movieId: number) => WatchProgress | undefined;
  removeFromHistory: (movieId: number) => void;
  clearWatchHistory: () => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      watchHistory: [],

      // Favorites
      addFavorite: (movie) => {
        set((state) => {
          // Check if already in favorites
          if (state.favorites.some((fav) => fav.id === movie.id)) {
            return state;
          }
          return { favorites: [movie, ...state.favorites] };
        });
      },

      removeFavorite: (movieId) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== movieId),
        }));
      },

      isFavorite: (movieId) => {
        return get().favorites.some((fav) => fav.id === movieId);
      },

      toggleFavorite: (movie) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(movie.id)) {
          removeFavorite(movie.id);
        } else {
          addFavorite(movie);
        }
      },

      // Watch History
      updateWatchProgress: (movieId, progress, title, posterPath) => {
        set((state) => {
          const existing = state.watchHistory.find((item) => item.movieId === movieId);

          if (existing) {
            // Update existing entry - move to front
            return {
              watchHistory: [
                { movieId, progress, title, posterPath, timestamp: Date.now() },
                ...state.watchHistory.filter((item) => item.movieId !== movieId),
              ].slice(0, 50),
            };
          } else {
            // Add new entry at front
            return {
              watchHistory: [
                { movieId, progress, title, posterPath, timestamp: Date.now() },
                ...state.watchHistory,
              ].slice(0, 50),
            };
          }
        });
      },

      getWatchProgress: (movieId) => {
        return get().watchHistory.find((item) => item.movieId === movieId);
      },

      removeFromHistory: (movieId) => {
        set((state) => ({
          watchHistory: state.watchHistory.filter((item) => item.movieId !== movieId),
        }));
      },

      clearWatchHistory: () => {
        set({ watchHistory: [] });
      },
    }),
    {
      name: 'mavida-user-preferences',
      skipHydration: true, // Skip automatic hydration to prevent SSR mismatch
      partialize: (state) => ({
        favorites: state.favorites,
        watchHistory: state.watchHistory,
      }),
    }
  )
);
