/**
 * User Preferences Store
 * Manages user favorites and watch history for both movies and TV shows
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';
import type {
  MediaType,
  FavoriteItem,
  WatchHistoryItem,
  ContinueWatchingItem,
} from '@/types/media';

interface WatchProgress {
  movieId: number;
  progress: number; // 0-100 percentage
  timestamp: number;
  title: string;
  posterPath: string | null;
}

interface UserPreferencesState {
  // Favorites (legacy - for movies only)
  favorites: Movie[];

  // New unified favorites (movies + TV shows)
  favoriteItems: FavoriteItem[];

  // Watch history with progress (legacy)
  watchHistory: WatchProgress[];

  // New unified watch history
  watchHistoryItems: WatchHistoryItem[];

  // Continue watching (derived from watch history)
  continueWatching: ContinueWatchingItem[];

  // Actions - Favorites (legacy)
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  toggleFavorite: (movie: Movie) => void;

  // Actions - New unified favorites
  addFavoriteItem: (id: number, type: MediaType) => void;
  removeFavoriteItem: (id: number, type: MediaType) => void;
  isFavoriteItem: (id: number, type: MediaType) => boolean;
  toggleFavoriteItem: (id: number, type: MediaType) => void;

  // Actions - Watch History (legacy)
  updateWatchProgress: (
    movieId: number,
    progress: number,
    title: string,
    posterPath: string | null
  ) => void;
  getWatchProgress: (movieId: number) => WatchProgress | undefined;
  removeFromHistory: (movieId: number) => void;
  clearWatchHistory: () => void;

  // Actions - New unified watch history
  updateWatchHistoryItem: (
    id: number,
    type: MediaType,
    progress: number,
    season?: number,
    episode?: number
  ) => void;
  getWatchHistoryItem: (id: number, type: MediaType) => WatchHistoryItem | undefined;
  removeWatchHistoryItem: (id: number, type: MediaType) => void;
  clearAllWatchHistory: () => void;

  // Actions - Continue Watching
  updateContinueWatching: (item: ContinueWatchingItem) => void;
  removeFromContinueWatching: (id: number, type: MediaType) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      // Legacy state
      favorites: [],
      watchHistory: [],

      // New unified state
      favoriteItems: [],
      watchHistoryItems: [],
      continueWatching: [],

      // Legacy Favorites (kept for backwards compatibility)
      addFavorite: (movie) => {
        set((state) => {
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

      // New Unified Favorites
      addFavoriteItem: (id, type) => {
        set((state) => {
          if (state.favoriteItems.some((fav) => fav.id === id && fav.type === type)) {
            return state;
          }
          return {
            favoriteItems: [
              { id, type, addedAt: new Date().toISOString() },
              ...state.favoriteItems,
            ],
          };
        });
      },

      removeFavoriteItem: (id, type) => {
        set((state) => ({
          favoriteItems: state.favoriteItems.filter((fav) => !(fav.id === id && fav.type === type)),
        }));
      },

      isFavoriteItem: (id, type) => {
        return get().favoriteItems.some((fav) => fav.id === id && fav.type === type);
      },

      toggleFavoriteItem: (id, type) => {
        const { isFavoriteItem, addFavoriteItem, removeFavoriteItem } = get();
        if (isFavoriteItem(id, type)) {
          removeFavoriteItem(id, type);
        } else {
          addFavoriteItem(id, type);
        }
      },

      // Legacy Watch History
      updateWatchProgress: (movieId, progress, title, posterPath) => {
        set((state) => {
          const existing = state.watchHistory.find((item) => item.movieId === movieId);

          if (existing) {
            return {
              watchHistory: [
                { movieId, progress, title, posterPath, timestamp: Date.now() },
                ...state.watchHistory.filter((item) => item.movieId !== movieId),
              ].slice(0, 50),
            };
          } else {
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

      // New Unified Watch History
      updateWatchHistoryItem: (id, type, progress, season, episode) => {
        set((state) => {
          const existing = state.watchHistoryItems.find(
            (item) => item.id === id && item.type === type
          );

          const newItem: WatchHistoryItem = {
            id,
            type,
            timestamp: Date.now(),
            progress,
            lastWatched: new Date().toISOString(),
            ...(type === 'tv' && season !== undefined && episode !== undefined
              ? { season, episode }
              : {}),
          };

          if (existing) {
            // Update existing - move to front
            return {
              watchHistoryItems: [
                newItem,
                ...state.watchHistoryItems.filter(
                  (item) => !(item.id === id && item.type === type)
                ),
              ].slice(0, 100), // Keep last 100 items
            };
          } else {
            // Add new entry
            return {
              watchHistoryItems: [newItem, ...state.watchHistoryItems].slice(0, 100),
            };
          }
        });
      },

      getWatchHistoryItem: (id, type) => {
        return get().watchHistoryItems.find((item) => item.id === id && item.type === type);
      },

      removeWatchHistoryItem: (id, type) => {
        set((state) => ({
          watchHistoryItems: state.watchHistoryItems.filter(
            (item) => !(item.id === id && item.type === type)
          ),
        }));
      },

      clearAllWatchHistory: () => {
        set({ watchHistoryItems: [], watchHistory: [] });
      },

      // Continue Watching
      updateContinueWatching: (item) => {
        set((state) => {
          const existing = state.continueWatching.find(
            (cw) => cw.id === item.id && cw.type === item.type
          );

          if (existing) {
            // Update existing - move to front
            return {
              continueWatching: [
                item,
                ...state.continueWatching.filter(
                  (cw) => !(cw.id === item.id && cw.type === item.type)
                ),
              ].slice(0, 20), // Keep last 20 items
            };
          } else {
            // Add new entry
            return {
              continueWatching: [item, ...state.continueWatching].slice(0, 20),
            };
          }
        });
      },

      removeFromContinueWatching: (id, type) => {
        set((state) => ({
          continueWatching: state.continueWatching.filter(
            (item) => !(item.id === id && item.type === type)
          ),
        }));
      },
    }),
    {
      name: 'mavida-user-preferences',
      skipHydration: true,
      partialize: (state) => ({
        favorites: state.favorites,
        watchHistory: state.watchHistory,
        favoriteItems: state.favoriteItems,
        watchHistoryItems: state.watchHistoryItems,
        continueWatching: state.continueWatching,
      }),
    }
  )
);
