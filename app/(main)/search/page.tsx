'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar, MediaTypeToggle } from '@/components/features/search';
import { SearchFilters } from '@/components/features/search/SearchFilters';
import { MediaGrid } from '@/components/features/media';
import { useMediaSearch } from '@/hooks';
import { MovieGridSkeleton, ErrorFallback, EmptyStateFallback, Button } from '@/components/ui';
import type { Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  // Derive query from initialQuery instead of using useState
  const query = initialQuery;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    year: '',
    genre: '',
    minRating: 0,
  });

  // Fetch unified search results (movies and TV shows)
  const { data, isLoading, isError, error, refetch } = useMediaSearch(query, {
    page,
    year: filters.year ? parseInt(filters.year) : undefined,
  });

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    } else {
      router.push('/search');
    }
    setPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const hasMorePages = data && page < data.totalPages;
  const hasPreviousPage = page > 1;

  // Combine movies and TV shows for display
  const allItems: (Movie | TVShow)[] = data ? [...data.movies, ...data.tvShows] : [];

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Search Bar */}
      <div className="mb-8">
        {/* <h1 className="text-3xl font-bold text-text-primary mb-4">Search Movies</h1> */}
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          showRecentSearches={!query}
          autoFocus={!initialQuery}
        />
      </div>

      {/* Media Type Toggle */}
      {query && (
        <div className="mb-6">
          <MediaTypeToggle />
        </div>
      )}

      {/* Filters */}
      {query && (
        <div className="mb-8">
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Results */}
      <div>
        {!query ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-text-secondary mb-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Start your search</h2>
            <p className="text-text-secondary">
              Search for movies by title, actor, director, or keyword
            </p>
          </div>
        ) : isLoading ? (
          <div>
            <div className="mb-4 text-muted-foreground">Searching...</div>
            <MovieGridSkeleton count={10} />
          </div>
        ) : isError ? (
          <ErrorFallback
            error={error as Error}
            onRetry={() => refetch()}
            message="Failed to load search results. Please try again."
            showHomeButton={false}
            className="py-16"
          />
        ) : data && allItems.length > 0 ? (
          <div>
            <div className="mb-4 text-muted-foreground">
              Found {data.totalResults.toLocaleString()} results for &ldquo;{query}&rdquo;
              {data.movies.length > 0 && data.tvShows.length > 0 && (
                <span className="ml-2">
                  ({data.movies.length} movies, {data.tvShows.length} TV shows)
                </span>
              )}
            </div>
            <MediaGrid items={allItems} />

            {/* Pagination Controls */}
            <div className="mt-12 space-y-6">
              {/* Load More Button (Progressive Loading) */}
              {hasMorePages && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleLoadMore}
                    className="min-w-[200px]"
                  >
                    Load More Results
                  </Button>
                </div>
              )}

              {/* Page Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage}
                  className="w-full sm:w-auto"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous Page
                </Button>

                {/* Page Info */}
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{page}</span> of{' '}
                  <span className="font-semibold text-foreground">{data.totalPages}</span>
                  {' • '}
                  Showing {allItems.length} of {data.totalResults.toLocaleString()} results
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={!hasMorePages}
                  className="w-full sm:w-auto"
                >
                  Next Page
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyStateFallback
            title="No results found"
            message={`No results found for "${query}". Try searching for something else or adjust your filters.`}
          />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 pt-24">
          <MovieGridSkeleton count={10} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
