/**
 * TV Shows Browse Page
 * Displays categorized TV show collections with filtering options
 */

'use client';

import { useState } from 'react';
import { TVGrid, TVGridSkeleton } from '@/components/features/tv';
import {
  useTrendingTV,
  usePopularTV,
  useTopRatedTV,
  useAiringTodayTV,
} from '@/services/tmdb/tv.queries';
import { Button, InlineErrorFallback } from '@/components/ui';

type CategoryType = 'trending' | 'popular' | 'top-rated' | 'airing-today';

interface Category {
  id: CategoryType;
  label: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'trending',
    label: 'Trending Now',
    description: 'TV shows everyone is watching right now',
  },
  {
    id: 'popular',
    label: 'Popular',
    description: 'Most popular TV shows of all time',
  },
  {
    id: 'top-rated',
    label: 'Top Rated',
    description: 'Highest rated TV shows by critics and audiences',
  },
  {
    id: 'airing-today',
    label: 'Airing Today',
    description: 'TV shows with new episodes airing today',
  },
];

export default function TVShowsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('trending');
  const [page, setPage] = useState(1);

  // Fetch data for all categories
  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
    error: trendingErrorObj,
    refetch: refetchTrending,
  } = useTrendingTV('week', page);

  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
    error: popularErrorObj,
    refetch: refetchPopular,
  } = usePopularTV(page);

  const {
    data: topRatedData,
    isLoading: topRatedLoading,
    isError: topRatedError,
    error: topRatedErrorObj,
    refetch: refetchTopRated,
  } = useTopRatedTV(page);

  const {
    data: airingTodayData,
    isLoading: airingTodayLoading,
    isError: airingTodayError,
    error: airingTodayErrorObj,
    refetch: refetchAiringToday,
  } = useAiringTodayTV(page);

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
      case 'airing-today':
        return {
          data: airingTodayData,
          isLoading: airingTodayLoading,
          isError: airingTodayError,
          error: airingTodayErrorObj,
          refetch: refetchAiringToday,
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Browse TV Shows</h1>
          <p className="text-muted-foreground">
            Discover your next binge-worthy series across different categories
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
                aria-label={`View ${category.label} TV shows`}
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
          <TVGridSkeleton count={20} />
        ) : isError ? (
          <InlineErrorFallback
            error={error as Error}
            onRetry={() => refetch()}
            message={`Failed to load ${currentCategory?.label.toLowerCase()} TV shows`}
          />
        ) : data && data.tvShows.length > 0 ? (
          <>
            <TVGrid tvShows={data.tvShows} />

            {/* Load More Button */}
            {hasMorePages && (
              <div className="mt-12 flex justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLoadMore}
                  className="min-w-[200px]"
                >
                  Load More TV Shows
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
            <p className="text-muted-foreground">No TV shows found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
