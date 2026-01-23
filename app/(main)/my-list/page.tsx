'use client';

import Heart from 'lucide-react/dist/esm/icons/heart';
import { useRouter } from 'next/navigation';
import { useUserPreferencesStore } from '@/stores';
import { useQueries } from '@tanstack/react-query';
import { getMovieDetails } from '@/services/tmdb';
import { getTMDBClient } from '@/services/tmdb/client';
import { MovieGrid } from '@/components/features/movie';
import { TVGrid } from '@/components/features/tv';
import { EmptyStateFallback } from '@/components/ui';
import type { Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';

/**
 * My List Page
 * Displays user's favorited movies and TV shows
 */
export default function MyListPage() {
  const router = useRouter();
  const favoriteItems = useUserPreferencesStore((state) => state.favoriteItems);
  const legacyFavorites = useUserPreferencesStore((state) => state.favorites);

  // Separate movie and TV show IDs
  const movieIds = favoriteItems.filter((item) => item.type === 'movie').map((item) => item.id);
  const tvShowIds = favoriteItems.filter((item) => item.type === 'tv').map((item) => item.id);

  // Fetch movie details for favorited movies
  const movieQueries = useQueries({
    queries: movieIds.map((id) => ({
      queryKey: ['movie', id],
      queryFn: () => getMovieDetails(id),
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    })),
  });

  // Fetch TV show details for favorited TV shows
  const tvShowQueries = useQueries({
    queries: tvShowIds.map((id) => ({
      queryKey: ['tv', id],
      queryFn: () => getTMDBClient().getTVShow(id),
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    })),
  });

  // Extract successful movie results
  const movies: Movie[] = movieQueries
    .filter((query) => query.isSuccess && query.data)
    .map((query) => query.data as Movie);

  // Extract successful TV show results
  const tvShows: TVShow[] = tvShowQueries
    .filter((query) => query.isSuccess && query.data)
    .map((query) => query.data as TVShow);

  // Combine with legacy favorites (for backwards compatibility)
  const allMovies = [
    ...movies,
    ...legacyFavorites.filter((m) => !movies.some((mov) => mov.id === m.id)),
  ];

  const totalItems = allMovies.length + tvShows.length;
  const isLoading = movieQueries.some((q) => q.isLoading) || tvShowQueries.some((q) => q.isLoading);

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="flex flex-col gap-y-2 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">My List</h1>
          <p className="text-lg text-muted-foreground">
            {totalItems === 0
              ? ''
              : `${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your list`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && totalItems === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading your list...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalItems === 0 ? (
          <EmptyStateFallback
            icon={Heart}
            title="Your list is empty"
            message="Browse movies and TV shows and click the heart icon to add them to your list for easy access later."
            action={() => router.push('/')}
            actionLabel="Browse Content"
          />
        ) : (
          <div className="space-y-16">
            {/* Movies Section */}
            {allMovies.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground">Movies ({allMovies.length})</h2>
                <MovieGrid movies={allMovies} className="mt-4" />
              </div>
            )}

            {/* TV Shows Section */}
            {tvShows.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground">TV Shows ({tvShows.length})</h2>
                <TVGrid tvShows={tvShows} className="mt-4" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
