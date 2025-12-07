'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/features/search/SearchBar';
import { SearchFilters } from '@/components/features/search/SearchFilters';
import { MovieGrid } from '@/components/features/movie/MovieGrid';
import { useSearchMovies } from '@/hooks/useMovies';
import { MovieGridSkeleton, ErrorFallback, EmptyStateFallback } from '@/components/ui';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    year: '',
    genre: '',
    minRating: 0,
  });

  // Fetch search results
  const { data, isLoading, isError, error, refetch } = useSearchMovies(query, {
    page: 1,
    year: filters.year ? parseInt(filters.year) : undefined,
  });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

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
        ) : data && data.movies.length > 0 ? (
          <div>
            <div className="mb-4 text-text-secondary">
              Found {data.totalResults.toLocaleString()} results for &ldquo;{query}&rdquo;
            </div>
            <MovieGrid movies={data.movies} />
          </div>
        ) : (
          <EmptyStateFallback
            title="No results found"
            message={`No movies found for "${query}". Try searching for something else or adjust your filters.`}
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
