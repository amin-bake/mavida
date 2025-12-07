/**
 * Search Page
 * Displays search results with filters
 */

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/features/search/SearchBar';
import { SearchFilters } from '@/components/features/search/SearchFilters';
import { MovieGrid } from '@/components/features/movie/MovieGrid';
import { useSearchMovies } from '@/hooks/useMovies';
import { Skeleton } from '@/components/ui/Skeleton';

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
  const { data, isLoading, isError, error } = useSearchMovies(query, {
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
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Search Movies</h1>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <div className="text-error mb-2">Error loading results</div>
            <p className="text-text-secondary">{error?.message || 'Something went wrong'}</p>
          </div>
        ) : data && data.movies.length > 0 ? (
          <div>
            <div className="mb-4 text-text-secondary">
              Found {data.totalResults.toLocaleString()} results for &ldquo;{query}&rdquo;
            </div>
            <MovieGrid movies={data.movies} />
          </div>
        ) : (
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
              <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-text-primary mb-2">No results found</h2>
            <p className="text-text-secondary">
              Try searching for something else or adjust your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-12 w-full mb-8" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
