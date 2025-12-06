/**
 * Search Store
 * Manages search state and recent searches history
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  // Recent searches (limited to 10)
  recentSearches: string[];

  // Current search query
  currentQuery: string;

  // Actions
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setCurrentQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      currentQuery: '',

      addRecentSearch: (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        set((state) => {
          // Remove query if it already exists
          const filtered = state.recentSearches.filter((q) => q !== trimmedQuery);

          // Add to front and limit to 10 items
          const updated = [trimmedQuery, ...filtered].slice(0, 10);

          return { recentSearches: updated };
        });
      },

      removeRecentSearch: (query) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter((q) => q !== query),
        }));
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      setCurrentQuery: (query) => {
        set({ currentQuery: query });
      },
    }),
    {
      name: 'mavida-search-storage',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);
