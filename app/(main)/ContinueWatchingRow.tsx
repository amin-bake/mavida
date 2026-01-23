'use client';

import dynamic from 'next/dynamic';
import { MovieRowSkeleton } from '@/components/ui';

// Dynamic import for the actual continue watching component
const ContinueWatchingRowContent = dynamic(() => import('./ContinueWatchingRowContent'), {
  loading: () => <MovieRowSkeleton />,
  ssr: false, // Disable SSR for this component
});

/**
 * Continue Watching Row Component
 * Client-side component that loads continue watching data after hydration
 */
export default function ContinueWatchingRow() {
  return <ContinueWatchingRowContent />;
}
