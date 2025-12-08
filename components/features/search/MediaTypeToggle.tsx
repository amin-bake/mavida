/**
 * MediaTypeToggle Component
 * Toggle buttons for filtering search results by media type (All, Movies, TV Shows)
 */

'use client';

import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@/components/ui';

export function MediaTypeToggle() {
  const { mediaType, setMediaType } = useSearchStore();

  const buttons = [
    { value: 'all' as const, label: 'All' },
    { value: 'movie' as const, label: 'Movies' },
    { value: 'tv' as const, label: 'TV Shows' },
  ];

  return (
    <div className="flex gap-2" role="group" aria-label="Media type filter">
      {buttons.map((button) => (
        <Button
          key={button.value}
          variant={mediaType === button.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMediaType(button.value)}
          aria-pressed={mediaType === button.value}
          className="min-w-20"
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
}
