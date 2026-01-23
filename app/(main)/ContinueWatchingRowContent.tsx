'use client';

import { useEnhancedContinueWatching } from '@/hooks';
import { EnhancedMediaRow } from '@/components/features/media';

/**
 * Continue Watching Row Content Component
 * Contains the actual continue watching logic, loaded dynamically
 */
export default function ContinueWatchingRowContent() {
  const { items: continueWatchingItems, isLoading } = useEnhancedContinueWatching();

  if (isLoading || continueWatchingItems.length === 0) {
    return null;
  }

  return (
    <EnhancedMediaRow
      title="Continue Watching"
      items={continueWatchingItems.map((item) => ({
        media: item.media,
        progress: item.progress,
        season: item.season,
        episode: item.episode,
      }))}
      priority={true}
    />
  );
}
