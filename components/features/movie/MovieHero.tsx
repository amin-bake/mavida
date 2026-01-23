'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTrendingMovies } from '@/hooks';
import { getBackdropUrl } from '@/lib/tmdb/images';
import { Button, MovieHeroSkeleton, InlineErrorFallback } from '@/components/ui';
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
  const { data, isLoading, isError, error, refetch } = useTrendingMovies('day', 1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const movies = (data?.movies || []).slice(0, 6);
  const currentMovie: Movie | undefined = movies[currentIndex];

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  // Handle touch start
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - next movie
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }

    if (isRightSwipe) {
      // Swipe right - previous movie
      setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length);
    }
  };

  // Navigate to next/previous movie
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length);
  };

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
    return <MovieHeroSkeleton />;
  }

  // Error state
  if (isError || !currentMovie) {
    return (
      <div className="relative h-[85vh] w-full bg-card flex items-center justify-center px-4">
        <InlineErrorFallback
          error={error as Error}
          onRetry={() => refetch()}
          message="Unable to load featured movies"
        />
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(currentMovie.backdropPath, 'original');
  const rating = currentMovie.rating.toFixed(1);

  return (
    <section
      className={`relative h-[95vh] w-full overflow-hidden group ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Featured movie"
      aria-roledescription="carousel"
    >
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

      {/* Gradient Overlays - Enhanced for both dark and bright images */}
      {/* Top gradient for navbar area - with soft fade at bottom */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-black/80 via-black/30 to-black/0 blur-in-xl" />

      {/* Content area gradient - ultra-soft multi-layer blending */}
      <div className="absolute bottom-0 left-0 w-[50%] h-[65%] bg-linear-to-tr from-black/60 via-black/20 to-transparent blur-2xl" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-20">
        <div className="max-w-3xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
            {currentMovie.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-5 mb-4 text-base md:text-lg">
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
          <p className="text-base md:text-lg lg:text-xl text-white/95 mt-4 mb-1 line-clamp-3 drop-shadow-lg leading-relaxed max-w-2xl">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 w-fit mt-4">
            <Button variant="default" size="lg" className="shadow-xl">
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

            <Button variant="glass" size="lg" className="shadow-xl">
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

      {/* Navigation Arrows - Desktop */}
      {movies.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Previous featured movie"
            title="Previous"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Next featured movie"
            title="Next"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Rotation Indicators */}
      {autoRotate && movies.length > 1 && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 md:bottom-8 flex gap-2 pt-4"
          role="tablist"
          aria-label="Movie carousel indicators"
        >
          {movies.map((_movie, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                index === currentIndex ? 'w-8 bg-white' : 'w-3 bg-white/50 hover:bg-white/75'
              }`}
              role="tab"
              aria-label={`View featured movie ${index + 1} of ${movies.length}`}
              aria-selected={index === currentIndex}
              aria-controls={`hero-movie-${index}`}
              title={movies[index]?.title || `Movie ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
