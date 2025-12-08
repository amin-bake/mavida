/**
 * MediaGrid Component
 * Displays a grid of movies and/or TV shows
 */

'use client';

import Link from 'next/link';
import type { Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';
import { MovieCard } from '@/components/features/movie';
import { TVShowCard } from '@/components/features/tv';
import { isTVShow } from '@/hooks/useMediaSearch';

interface MediaGridProps {
  items: (Movie | TVShow)[];
  className?: string;
}

export function MediaGrid({ items, className = '' }: MediaGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 ${className}`}
    >
      {items.map((item) => {
        const isTV = isTVShow(item);
        const href = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;

        return (
          <Link key={`${isTV ? 'tv' : 'movie'}-${item.id}`} href={href}>
            {isTV ? (
              <TVShowCard tvShow={item as TVShow} asChild />
            ) : (
              <MovieCard movie={item as Movie} asChild />
            )}
          </Link>
        );
      })}
    </div>
  );
}
