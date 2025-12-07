'use client';

import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  useNowPlayingMovies,
} from '@/hooks';
import { MovieHero, MovieRow } from '@/components/features/movie';
import { Skeleton } from '@/components/ui';
import { useUserPreferencesStore } from '@/stores';

/**
 * Homepage
 * Main landing page with hero and movie rows
 */
export default function HomePage() {
  // Fetch movie data
  const { data: trendingData, isLoading: trendingLoading } = useTrendingMovies('week', 1);
  const { data: popularData, isLoading: popularLoading } = usePopularMovies(1);
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRatedMovies(1);
  const { data: nowPlayingData, isLoading: nowPlayingLoading } = useNowPlayingMovies(1);

  // Get watch history for "Continue Watching" row
  const watchHistory = useUserPreferencesStore((state) => state.watchHistory);

  // Note: Continue Watching will be implemented when movie detail pages are available
  // For now, we'll skip this row as we need to fetch movies by ID
  // const continueWatchingMovies = watchHistory
  //   .filter((item) => item.progress < 90)
  //   .sort((a, b) => b.timestamp - a.timestamp)
  //   .slice(0, 20);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <MovieHero />

      {/* Movie Rows */}
      <div className="relative -mt-24 z-10 flex flex-col gap-12 pb-20">
        {/* Continue Watching Row - Will be implemented in Phase 5 */}
        {/* TODO: Implement Continue Watching with movie detail fetch */}

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
          <MovieRow title="Trending Now" movies={trendingData.movies} priority={true} />
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
