/**
 * Player Preferences Store
 * Manages autoplay and autonext settings with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlayerPreferencesState {
  autoplayEnabled: boolean;
  autonextEnabled: boolean;
  setAutoplay: (enabled: boolean) => void;
  setAutonext: (enabled: boolean) => void;
}

export const usePlayerPreferencesStore = create<PlayerPreferencesState>()(
  persist(
    (set) => ({
      // Default states
      autoplayEnabled: true,
      autonextEnabled: true,

      // Actions
      setAutoplay: (enabled) => set({ autoplayEnabled: enabled }),
      setAutonext: (enabled) => set({ autonextEnabled: enabled }),
    }),
    {
      name: 'player-preferences', // localStorage key
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);
