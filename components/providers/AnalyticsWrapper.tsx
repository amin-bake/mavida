'use client';

import dynamic from 'next/dynamic';

// Dynamic import for analytics - loads after hydration
const Analytics = dynamic(() => import('@vercel/analytics/next').then((m) => m.Analytics), {
  ssr: false,
});

/**
 * Analytics Wrapper Component
 * Loads Vercel Analytics after hydration
 */
export function AnalyticsWrapper() {
  return <Analytics />;
}
