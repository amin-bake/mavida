'use client';

import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  useNowPlayingMovies,
  useContinueWatching,
} from '@/hooks';
import { MovieHero, MovieRow } from '@/components/features/movie';
import { Skeleton } from '@/components/ui';

/**
 * Homepage
 * Main landing page with hero and movie rows
 */
export default function HomePage() {
  // Fetch movie data
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError,
  } = useTrendingMovies('week', 1);
  const { data: popularData, isLoading: popularLoading, error: popularError } = usePopularMovies(1);
  const {
    data: topRatedData,
    isLoading: topRatedLoading,
    error: topRatedError,
  } = useTopRatedMovies(1);
  const {
    data: nowPlayingData,
    isLoading: nowPlayingLoading,
    error: nowPlayingError,
  } = useNowPlayingMovies(1);

  // Get Continue Watching items with movie details
  const { items: continueWatchingItems, isLoading: continueWatchingLoading } =
    useContinueWatching();

  return (
    <div className="min-h-screen">
      {/* Hero Section - extends under navbar */}
      <MovieHero />

      {/* Movie Rows - with top padding */}
      <div className="relative z-10 flex flex-col gap-16 pb-20 pt-6">
        {/* Continue Watching Row */}
        {continueWatchingLoading ? (
          <div className="px-4 md:px-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-60 w-40 shrink-0" />
              ))}
            </div>
          </div>
        ) : continueWatchingItems.length > 0 ? (
          <MovieRow
            title="Continue Watching"
            movies={continueWatchingItems.map((item) => item.movie)}
            priority={true}
          />
        ) : null}

        {/* Trending Now Row */}
        {trendingLoading ? (
          <div className="px-4 md:px-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-60 w-40 shrink-0" />
              ))}
            </div>
          </div>
        ) : trendingData?.movies && trendingData.movies.length > 0 ? (
          <MovieRow
            title="Trending Now"
            movies={trendingData.movies}
            priority={continueWatchingItems.length === 0}
          />
        ) : null}

        {/* Now Playing Row */}
        {nowPlayingLoading ? (
          <div className="px-4 md:px-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-60 w-40 shrink-0" />
              ))}
            </div>
          </div>
        ) : nowPlayingData?.movies && nowPlayingData.movies.length > 0 ? (
          <MovieRow
            title="Now Playing in Theaters"
            movies={nowPlayingData.movies}
            priority={false}
          />
        ) : null}

        {/* Popular Movies Row */}
        {popularLoading ? (
          <div className="px-4 md:px-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-60 w-40 shrink-0" />
              ))}
            </div>
          </div>
        ) : popularData?.movies && popularData.movies.length > 0 ? (
          <MovieRow title="Popular Movies" movies={popularData.movies} priority={false} />
        ) : null}

        {/* Top Rated Row */}
        {topRatedLoading ? (
          <div className="px-4 md:px-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-60 w-40 shrink-0" />
              ))}
            </div>
          </div>
        ) : topRatedData?.movies && topRatedData.movies.length > 0 ? (
          <MovieRow title="Top Rated Movies" movies={topRatedData.movies} priority={false} />
        ) : null}
      </div>
    </div>
  );
}
