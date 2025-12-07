/**
 * Store Hydration Component
 * Handles client-side hydration of Zustand persisted stores
 */

'use client';

import { useEffect, useState } from 'react';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [_isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Rehydrate the store from localStorage on mount
    useUserPreferencesStore.persist.rehydrate();
    // Mark as hydrated in next tick to avoid cascading renders
    requestAnimationFrame(() => setIsHydrated(true));
  }, []);

  return <>{children}</>;
}
