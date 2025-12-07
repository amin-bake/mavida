'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTrendingMovies } from '@/hooks';
import { getBackdropUrl } from '@/lib/tmdb/images';
import { Button } from '@/components/ui';
import { Movie } from '@/types/movie';

interface MovieHeroProps {
  /**
   * Whether to auto-rotate through multiple featured movies
   * @default true
   */
  autoRotate?: boolean;
  /**
   * Rotation interval in milliseconds
   * @default 10000 (10 seconds)
   */
  rotationInterval?: number;
  /**
   * Custom className for the hero container
   */
  className?: string;
}

export function MovieHero({
  autoRotate = true,
  rotationInterval = 10000,
  className = '',
}: MovieHeroProps) {
  const { data, isLoading, isError } = useTrendingMovies('day', 1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const movies = data?.movies || [];
  const currentMovie: Movie | undefined = movies[currentIndex];

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || movies.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [autoRotate, movies.length, rotationInterval]);

  // Loading state
  if (isLoading) {
    return (
      <div className="relative h-[70vh] w-full animate-pulse bg-surface-secondary">
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="h-12 w-2/3 rounded bg-surface-tertiary mb-4" />
          <div className="h-6 w-1/2 rounded bg-surface-tertiary mb-6" />
          <div className="flex gap-3">
            <div className="h-12 w-32 rounded bg-surface-tertiary" />
            <div className="h-12 w-32 rounded bg-surface-tertiary" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !currentMovie) {
    return (
      <div className="relative h-[70vh] w-full bg-surface-secondary flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-xl text-text-secondary mb-4">Unable to load featured movies</p>
          <Button variant="default">
            <Link href="/search">Browse Movies</Link>
          </Button>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(currentMovie.backdropPath, 'original');
  const rating = currentMovie.rating.toFixed(1);

  return (
    <div className={`relative h-[70vh] w-full overflow-hidden ${className}`}>
      {/* Backdrop Image */}
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt={currentMovie.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-primary/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-20">
        <div className="max-w-3xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
            {currentMovie.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-5 mb-8 text-base md:text-lg">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <svg
                className="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white font-medium">{rating}</span>
            </div>

            {/* Release Year */}
            <span className="text-text-secondary">
              {new Date(currentMovie.releaseDate).getFullYear()}
            </span>

            {/* Separator */}
            {currentMovie.genres.length > 0 && <span className="text-text-secondary">•</span>}

            {/* Primary Genre */}
            {currentMovie.genres.length > 0 && (
              <span className="text-text-secondary">{currentMovie.genres[0]}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-white/95 mb-10 line-clamp-3 drop-shadow-lg leading-relaxed max-w-2xl">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button variant="default" size="lg">
              <Link href={`/movie/${currentMovie.id}/watch`} className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play
              </Link>
            </Button>

            <Button variant="secondary" size="lg">
              <Link href={`/movie/${currentMovie.id}`} className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Rotation Indicators */}
      {autoRotate && movies.length > 1 && (
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex gap-2">
          {movies.slice(0, 5).map((_movie, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 transition-all duration-300 rounded-full ${
                index === currentIndex ? 'w-8 bg-white' : 'w-1 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`View movie ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
