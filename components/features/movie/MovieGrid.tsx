/**
 * Movie Grid Component
 * Displays movies in a responsive grid layout
 */

'use client';

import { MediaCard } from '../media/MediaCard';
import type { Movie } from '@/types/movie';

interface MovieGridProps {
  movies: Movie[];
  className?: string;
}

export function MovieGrid({ movies, className = '' }: MovieGridProps) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}
    >
      {movies.map((movie) => (
        <MediaCard key={movie.id} media={movie} />
      ))}
    </div>
  );
}
