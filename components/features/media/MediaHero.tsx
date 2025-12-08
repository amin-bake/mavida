/**
 * Media Hero Component
 * Displays a rotating hero banner with both movies and TV shows (trending content)
 * Maintains original MovieHero design and UX
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTrendingMovies } from '@/hooks';
import { useTrendingTV } from '@/services/tmdb/tv.queries';
import { getBackdropUrl } from '@/lib/tmdb/images';
import { Button, MovieHeroSkeleton, InlineErrorFallback } from '@/components/ui';
import { Movie } from '@/types/movie';
import { TVShow } from '@/types/tv';

type MediaItem = Movie | TVShow;

interface MediaHeroProps {
  autoRotate?: boolean;
  rotationInterval?: number;
  className?: string;
}

// Type guards
function isMovie(media: MediaItem): media is Movie {
  return 'title' in media;
}

function isTVShow(media: MediaItem): media is TVShow {
  return 'name' in media;
}

export function MediaHero({
  autoRotate = true,
  rotationInterval = 10000,
  className = '',
}: MediaHeroProps) {
  const {
    data: moviesData,
    isLoading: moviesLoading,
    isError: moviesError,
    error: moviesErrorObj,
    refetch: refetchMovies,
  } = useTrendingMovies('day', 1);

  const {
    data: tvData,
    isLoading: tvLoading,
    isError: tvError,
    error: tvErrorObj,
    refetch: refetchTV,
  } = useTrendingTV('day', 1);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Combine and interleave movies and TV shows for variety
  const movies = (moviesData?.movies || []).slice(0, 3);
  const tvShows = (tvData?.tvShows || []).slice(0, 3);

  // Interleave: movie, TV, movie, TV, etc.
  const mediaItems: MediaItem[] = [];
  const maxLength = Math.max(movies.length, tvShows.length);
  for (let i = 0; i < maxLength; i++) {
    if (movies[i]) mediaItems.push(movies[i]);
    if (tvShows[i]) mediaItems.push(tvShows[i]);
  }

  const currentMedia: MediaItem | undefined = mediaItems[currentIndex];
  const isLoading = moviesLoading || tvLoading;
  const isError = (moviesError || tvError) && !movies.length && !tvShows.length;
  const error = moviesErrorObj || tvErrorObj;

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || mediaItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, rotationInterval);
    return () => clearInterval(timer);
  }, [autoRotate, mediaItems.length, rotationInterval]);

  // Loading state
  if (isLoading) {
    // console.log('[MediaHero] Loading...');
    return <MovieHeroSkeleton />;
  }

  // Error state
  if (isError || !currentMedia) {
    console.error('[MediaHero] Error or no media:', error);
    return (
      <div className="relative h-[85vh] w-full bg-card flex items-center justify-center px-4">
        <InlineErrorFallback
          error={error as Error}
          onRetry={() => {
            refetchMovies();
            refetchTV();
          }}
          message="Unable to load featured content"
        />
      </div>
    );
  }

  // Get media properties
  const title = isMovie(currentMedia) ? currentMedia.title : currentMedia.name;
  const overview = currentMedia.overview;
  const backdropPath = isMovie(currentMedia)
    ? currentMedia.backdropPath || currentMedia.backdrop_path
    : currentMedia.backdrop_path;
  const backdropUrl = backdropPath ? getBackdropUrl(backdropPath, 'original') : null;

  // Release date/year
  const releaseDate = isMovie(currentMedia)
    ? currentMedia.releaseDate
    : currentMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

  // Rating
  const rating = isMovie(currentMedia)
    ? currentMedia.rating || currentMedia.vote_average || 0
    : currentMedia.vote_average || 0;

  // Genres
  const genres = isMovie(currentMedia)
    ? currentMedia.genres
    : currentMedia.genres?.map((g) => g.name) || [];

  // Links
  const detailLink = isMovie(currentMedia) ? `/movie/${currentMedia.id}` : `/tv/${currentMedia.id}`;
  const watchLink = isMovie(currentMedia)
    ? `/movie/${currentMedia.id}/watch`
    : `/tv/${currentMedia.id}`;

//   console.log(
//     '[MediaHero] Rendering:',
//     title,
//     'Type:',
//     isMovie(currentMedia) ? 'Movie' : 'TV Show'
//   );

  return (
    <section
      className={`relative h-[95vh] w-full overflow-hidden group ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Featured content"
      aria-roledescription="carousel"
    >
      {/* Backdrop Image */}
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4="
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-background" />
      )}

      {/* Gradient Overlays - matching original MovieHero */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-black/80 via-black/30 to-black/0 blur-in-xl" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[65%] bg-linear-to-tr from-black/60 via-black/20 to-transparent blur-2xl" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-20">
        <div className="max-w-3xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
            {title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-5 mb-4 text-base md:text-lg">
            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-5 h-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-medium">{rating.toFixed(1)}</span>
              </div>
            )}

            {/* Release Year */}
            {releaseYear && <span className="text-text-secondary">{releaseYear}</span>}

            {/* Separator */}
            {genres.length > 0 && <span className="text-text-secondary">•</span>}

            {/* Primary Genre */}
            {genres.length > 0 && <span className="text-text-secondary">{genres[0]}</span>}

            {/* Media Type Badge */}
            <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded text-white">
              {isMovie(currentMedia) ? 'MOVIE' : 'TV SERIES'}
            </span>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-white/95 mt-4 mb-1 line-clamp-3 drop-shadow-lg leading-relaxed max-w-2xl">
            {overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 w-fit mt-4">
            <Button variant="default" size="lg" className="shadow-xl">
              <Link href={watchLink} className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                {isMovie(currentMedia) ? 'Play' : 'View Series'}
              </Link>
            </Button>

            <Button variant="glass" size="lg" className="shadow-xl">
              <Link href={detailLink} className="flex items-center">
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
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Previous featured item"
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

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Next featured item"
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
      {autoRotate && mediaItems.length > 1 && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 md:bottom-8 flex gap-2 pt-4"
          role="tablist"
          aria-label="Content carousel indicators"
        >
          {mediaItems.map((item, index) => {
            const itemTitle = isMovie(item) ? item.title : item.name;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-3 bg-white/50 hover:bg-white/75'
                }`}
                role="tab"
                aria-label={`View ${itemTitle}`}
                aria-selected={index === currentIndex}
                title={itemTitle}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
