'use client';

import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  useNowPlayingMovies,
  useContinueWatching,
} from '@/hooks';
import { MovieHero, MovieRow } from '@/components/features/movie';
import { MovieRowSkeleton, LazyLoad, InlineErrorFallback } from '@/components/ui';

/**
 * Homepage
 * Main landing page with hero and movie rows
 */
export default function HomePage() {
  // Fetch movie data with refetch capability
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingMovies('week', 1);
  const {
    data: popularData,
    isLoading: popularLoading,
    error: popularError,
    refetch: refetchPopular,
  } = usePopularMovies(1);
  const {
    data: topRatedData,
    isLoading: topRatedLoading,
    error: topRatedError,
    refetch: refetchTopRated,
  } = useTopRatedMovies(1);
  const {
    data: nowPlayingData,
    isLoading: nowPlayingLoading,
    error: nowPlayingError,
    refetch: refetchNowPlaying,
  } = useNowPlayingMovies(1);

  // Get Continue Watching items
  const { items: continueWatchingItems, isLoading: continueWatchingLoading } =
    useContinueWatching();

  // Create progress map for Continue Watching
  const continueWatchingProgressMap = Object.fromEntries(
    continueWatchingItems.map((item) => [item.movie.id, item.progress])
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section - extends under navbar */}
      <MovieHero />

      {/* Movie Rows - with top padding */}
      <div className="relative z-10 flex flex-col gap-16 pb-20 pt-6">
        {/* Continue Watching Row */}
        {continueWatchingLoading ? (
          <MovieRowSkeleton />
        ) : continueWatchingItems.length > 0 ? (
          <MovieRow
            title="Continue Watching"
            movies={continueWatchingItems.map((item) => item.movie)}
            progressMap={continueWatchingProgressMap}
            priority={true}
          />
        ) : null}

        {/* Trending Now Row */}
        {trendingLoading ? (
          <MovieRowSkeleton />
        ) : trendingError ? (
          <div className="px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
            <InlineErrorFallback
              error={trendingError}
              onRetry={() => refetchTrending()}
              message="Failed to load trending movies"
            />
          </div>
        ) : trendingData?.movies && trendingData.movies.length > 0 ? (
          <MovieRow title="Trending Now" movies={trendingData.movies} priority={false} />
        ) : null}

        {/* Now Playing Row */}
        {nowPlayingLoading ? (
          <MovieRowSkeleton />
        ) : nowPlayingError ? (
          <div className="px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-4">Now Playing in Theaters</h2>
            <InlineErrorFallback
              error={nowPlayingError}
              onRetry={() => refetchNowPlaying()}
              message="Failed to load now playing movies"
            />
          </div>
        ) : nowPlayingData?.movies && nowPlayingData.movies.length > 0 ? (
          <MovieRow
            title="Now Playing in Theaters"
            movies={nowPlayingData.movies}
            priority={false}
          />
        ) : null}

        {/* Popular Movies Row - Lazy Loaded */}
        <LazyLoad placeholder={<MovieRowSkeleton />}>
          {popularLoading ? (
            <MovieRowSkeleton />
          ) : popularError ? (
            <div className="px-4 md:px-8">
              <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
              <InlineErrorFallback
                error={popularError}
                onRetry={() => refetchPopular()}
                message="Failed to load popular movies"
              />
            </div>
          ) : popularData?.movies && popularData.movies.length > 0 ? (
            <MovieRow title="Popular Movies" movies={popularData.movies} priority={false} />
          ) : null}
        </LazyLoad>

        {/* Top Rated Row - Lazy Loaded */}
        <LazyLoad placeholder={<MovieRowSkeleton />}>
          {topRatedLoading ? (
            <MovieRowSkeleton />
          ) : topRatedError ? (
            <div className="px-4 md:px-8">
              <h2 className="text-2xl font-bold mb-4">Top Rated Movies</h2>
              <InlineErrorFallback
                error={topRatedError}
                onRetry={() => refetchTopRated()}
                message="Failed to load top rated movies"
              />
            </div>
          ) : topRatedData?.movies && topRatedData.movies.length > 0 ? (
            <MovieRow title="Top Rated Movies" movies={topRatedData.movies} priority={false} />
          ) : null}
        </LazyLoad>
      </div>
    </div>
  );
}
