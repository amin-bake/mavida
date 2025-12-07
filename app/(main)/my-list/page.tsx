'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserPreferencesStore } from '@/stores';
import { MovieGrid } from '@/components/features/movie';
import { EmptyStateFallback } from '@/components/ui';

/**
 * My List Page
 * Displays user's favorited movies
 */
export default function MyListPage() {
  const router = useRouter();
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
          <EmptyStateFallback
            icon={Heart}
            title="Your list is empty"
            message="Browse movies and click the heart icon to add them to your list for easy access later."
            action={() => router.push('/')}
            actionLabel="Browse Movies"
          />
        ) : (
          /* Movie Grid */
          <MovieGrid movies={favorites} />
        )}
      </div>
    </div>
  );
}
