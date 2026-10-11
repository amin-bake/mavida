/**
 * Store Hydration Component
 * Handles client-side hydration of Zustand persisted stores
 */

'use client';

import { useEffect, useState } from 'react';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

// One-time migration: the preferences store used to persist in a cookie, which is
// limited to ~4 KB and silently dropped larger writes. Any data that DID fit is
// moved to localStorage before the store rehydrates.
const LEGACY_COOKIE = 'mavida-user-preferences';

function migrateLegacyCookie() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(LEGACY_COOKIE)) return; // already has newer data
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LEGACY_COOKIE}=`))
    ?.split('=')[1];
  if (!cookie) return;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie));
    if (parsed && typeof parsed === 'object' && parsed.state) {
      // zustand persist format: { state, version }
      localStorage.setItem(LEGACY_COOKIE, JSON.stringify(parsed));
    }
  } catch {
    // Ignore malformed legacy data.
  }
  // Remove the old cookie regardless so it stops shadowing future saves.
  document.cookie = `${LEGACY_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [_isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    migrateLegacyCookie();
    // Rehydrate the store from localStorage on mount
    useUserPreferencesStore.persist.rehydrate();
    // Mark as hydrated in next tick to avoid cascading renders
    requestAnimationFrame(() => setIsHydrated(true));
  }, []);

  return <>{children}</>;
}
