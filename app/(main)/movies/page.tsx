/**
 * Movies Browse Page
 * Displays categorized movie collections with filtering options
 */

'use client';

import { useState } from 'react';
import { MovieGrid } from '@/components/features/movie';
import {
  usePopularMovies,
  useTopRatedMovies,
  useTrendingMovies,
  useNowPlayingMovies,
} from '@/hooks/useMovies';
import { Button, MovieGridSkeleton, InlineErrorFallback } from '@/components/ui';

type CategoryType = 'trending' | 'popular' | 'top-rated' | 'now-playing';

interface Category {
  id: CategoryType;
  label: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'trending',
    label: 'Trending Now',
    description: 'Movies everyone is watching right now',
  },
  {
    id: 'popular',
    label: 'Popular',
    description: 'Most popular movies of all time',
  },
  {
    id: 'top-rated',
    label: 'Top Rated',
    description: 'Highest rated movies by critics and audiences',
  },
  {
    id: 'now-playing',
    label: 'Now Playing',
    description: 'Currently playing in theaters',
  },
];

export default function MoviesPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('trending');
  const [page, setPage] = useState(1);

  // Fetch data for all categories
  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
    error: trendingErrorObj,
    refetch: refetchTrending,
  } = useTrendingMovies('week', page);

  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
    error: popularErrorObj,
    refetch: refetchPopular,
  } = usePopularMovies(page);

  const {
    data: topRatedData,
    isLoading: topRatedLoading,
    isError: topRatedError,
    error: topRatedErrorObj,
    refetch: refetchTopRated,
  } = useTopRatedMovies(page);

  const {
    data: nowPlayingData,
    isLoading: nowPlayingLoading,
    isError: nowPlayingError,
    error: nowPlayingErrorObj,
    refetch: refetchNowPlaying,
  } = useNowPlayingMovies(page);

  // Get current category data
  const getCurrentData = () => {
    switch (selectedCategory) {
      case 'trending':
        return {
          data: trendingData,
          isLoading: trendingLoading,
          isError: trendingError,
          error: trendingErrorObj,
          refetch: refetchTrending,
        };
      case 'popular':
        return {
          data: popularData,
          isLoading: popularLoading,
          isError: popularError,
          error: popularErrorObj,
          refetch: refetchPopular,
        };
      case 'top-rated':
        return {
          data: topRatedData,
          isLoading: topRatedLoading,
          isError: topRatedError,
          error: topRatedErrorObj,
          refetch: refetchTopRated,
        };
      case 'now-playing':
        return {
          data: nowPlayingData,
          isLoading: nowPlayingLoading,
          isError: nowPlayingError,
          error: nowPlayingErrorObj,
          refetch: refetchNowPlaying,
        };
    }
  };

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);
  const { data, isLoading, isError, error, refetch } = getCurrentData();

  const handleCategoryChange = (categoryId: CategoryType) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset to first page when changing category
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMorePages = data && page < data.totalPages;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Browse Movies</h1>
          <p className="text-muted-foreground">
            Explore our collection of movies across different categories
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 border-b border-border overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={`View ${category.label} movies`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Description */}
        {currentCategory && (
          <div className="mb-8">
            <p className="text-muted-foreground">{currentCategory.description}</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <MovieGridSkeleton count={20} />
        ) : isError ? (
          <InlineErrorFallback
            error={error as Error}
            onRetry={() => refetch()}
            message={`Failed to load ${currentCategory?.label.toLowerCase()} movies`}
          />
        ) : data && data.movies.length > 0 ? (
          <>
            <MovieGrid movies={data.movies} />

            {/* Load More Button */}
            {hasMorePages && (
              <div className="mt-12 flex justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLoadMore}
                  className="min-w-[200px]"
                >
                  Load More Movies
                </Button>
              </div>
            )}

            {/* Page Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing page {page} of {data.totalPages}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No movies found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
