import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getTrendingTV,
  getPopularTV,
} from '@/services/tmdb';
import { MovieRow } from '@/components/features/movie';
import { TVShowRow } from '@/components/features/tv';
import { MovieRowSkeleton, LazyLoad } from '@/components/ui';

// Dynamic imports for heavy components (Rule 2.4)
const MediaHero = dynamic(
  () => import('@/components/features/media/MediaHero').then((m) => ({ default: m.MediaHero })),
  {
    loading: () => <div className="h-[56vh] bg-black animate-pulse" />,
  }
);

// Continue Watching Row - Client-side component
const ContinueWatchingRow = dynamic(() => import('./ContinueWatchingRow'), {
  loading: () => <MovieRowSkeleton />,
});

/**
 * Homepage
 * Main landing page with hero and movie rows
 */
export default async function HomePage() {
  // Fetch all data in parallel (Rule 1.4: Promise.all for independent operations)
  const [trendingData, popularData, topRatedData, nowPlayingData, trendingTVData, popularTVData] =
    await Promise.all([
      getTrendingMovies('week', 1),
      getPopularMovies(1),
      getTopRatedMovies(1),
      getNowPlayingMovies(1),
      getTrendingTV('week', 1),
      getPopularTV(1),
    ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section - extends under navbar */}
      <Suspense fallback={<div className="h-[56vh] bg-black animate-pulse" />}>
        <MediaHero initialData={{ trending: trendingData, trendingTV: trendingTVData }} />
      </Suspense>

      {/* Movie Rows - with top padding and proper spacing */}
      <div className="relative z-10 space-y-16 pb-20 pt-6 px-0">
        {/* Continue Watching Row - Client-side only */}
        <ContinueWatchingRow />

        {/* Trending Now Row */}
        {trendingData.movies && trendingData.movies.length > 0 && (
          <MovieRow title="Trending Now" movies={trendingData.movies} priority={false} />
        )}

        {/* Now Playing Row */}
        {nowPlayingData.movies && nowPlayingData.movies.length > 0 && (
          <MovieRow
            title="Now Playing in Theaters"
            movies={nowPlayingData.movies}
            priority={false}
          />
        )}

        {/* Popular Movies Row - Lazy Loaded */}
        <LazyLoad placeholder={<MovieRowSkeleton />}>
          <Suspense fallback={<MovieRowSkeleton />}>
            {popularData.movies && popularData.movies.length > 0 && (
              <MovieRow title="Popular Movies" movies={popularData.movies} priority={false} />
            )}
          </Suspense>
        </LazyLoad>

        {/* Top Rated Row - Lazy Loaded */}
        <LazyLoad placeholder={<MovieRowSkeleton />}>
          <Suspense fallback={<MovieRowSkeleton />}>
            {topRatedData.movies && topRatedData.movies.length > 0 && (
              <MovieRow title="Top Rated Movies" movies={topRatedData.movies} priority={false} />
            )}
          </Suspense>
        </LazyLoad>

        {/* Trending TV Shows Row - Lazy Loaded */}
        <LazyLoad placeholder={<MovieRowSkeleton />}>
          <Suspense fallback={<MovieRowSkeleton />}>
            {trendingTVData.tvShows && trendingTVData.tvShows.length > 0 && (
              <TVShowRow
                title="Trending TV Shows"
                tvShows={trendingTVData.tvShows}
                priority={false}
              />
            )}
          </Suspense>
        </LazyLoad>

        {/* Popular TV Shows Row - Lazy Loaded */}
        <LazyLoad placeholder={<MovieRowSkeleton />}>
          <Suspense fallback={<MovieRowSkeleton />}>
            {popularTVData.tvShows && popularTVData.tvShows.length > 0 && (
              <TVShowRow
                title="Popular TV Shows"
                tvShows={popularTVData.tvShows}
                priority={false}
              />
            )}
          </Suspense>
        </LazyLoad>
      </div>
    </div>
  );
}
