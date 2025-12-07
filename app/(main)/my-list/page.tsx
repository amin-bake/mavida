'use client';

import { useUserPreferencesStore } from '@/stores';
import { MovieGrid } from '@/components/features/movie';

/**
 * My List Page
 * Displays user's favorited movies
 */
export default function MyListPage() {
  const favorites = useUserPreferencesStore((state) => state.favorites);

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">My List</h1>
          <p className="text-lg text-muted-foreground">
            {favorites.length === 0
              ? 'Your favorite movies will appear here'
              : `${favorites.length} ${favorites.length === 1 ? 'movie' : 'movies'} in your list`}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="w-24 h-24 text-muted-foreground mb-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your list is empty</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Browse movies and click the heart icon to add them to your list for easy access later.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Movies
            </a>
          </div>
        ) : (
          /* Movie Grid */
          <MovieGrid movies={favorites} />
        )}
      </div>
    </div>
  );
}
