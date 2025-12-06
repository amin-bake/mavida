# TanStack Query Integration Guide

## Overview

TanStack Query (React Query) is now fully integrated with custom hooks for all movie-related data fetching. This provides automatic caching, background updates, and loading/error states.

## Quick Start

### 1. Using Movie Hooks

```typescript
'use client'; // Required for client components

import { useTrendingMovies, useMovieDetail } from '@/hooks';

function MyComponent() {
  // Fetch trending movies
  const { data, isLoading, error } = useTrendingMovies('week', 1);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.movies.map(movie => (
        <div key={movie.id}>{movie.title}</div>
      ))}
    </div>
  );
}
```

## Available Hooks

### List Hooks

- `useTrendingMovies(timeWindow, page)` - Trending movies (day/week)
- `usePopularMovies(page)` - Popular movies
- `useTopRatedMovies(page)` - Top rated movies
- `useNowPlayingMovies(page)` - Currently in theaters
- `useUpcomingMovies(page)` - Upcoming releases

### Detail Hooks

- `useMovieDetail(movieId)` - Complete movie information
- `useSimilarMovies(movieId, page)` - Similar movies
- `useMovieRecommendations(movieId, page)` - Recommendations

### Search Hooks

- `useSearchMovies(query, params)` - Search by query
- `useDiscoverMovies(filters)` - Discover with filters

## Hook Return Values

All hooks return a `UseQueryResult` object:

```typescript
{
  data: MoviesPage | MovieDetail | undefined,
  isLoading: boolean,
  isError: boolean,
  error: Error | null,
  isFetching: boolean,
  refetch: () => void,
  // ... more properties
}
```

## Cache Configuration

- **Default:** 5 minutes
- **Trending/Popular:** 1 hour
- **Movie Details:** 24 hours
- **Search:** 5 minutes

## Advanced Usage

### Pagination

```typescript
const [page, setPage] = useState(1);
const { data } = useTrendingMovies('week', page);

// Next page
<button onClick={() => setPage(p => p + 1)}>Next</button>
```

### Conditional Fetching

```typescript
// Only fetch if movieId exists
const { data } = useMovieDetail(movieId, {
  enabled: !!movieId,
});
```

### Prefetching on Hover

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { movieKeys } from '@/lib/queryKeys';

function MovieCard({ movieId }: { movieId: number }) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: movieKeys.detail(movieId),
      queryFn: () => getMovieDetails(movieId),
    });
  };

  return <div onMouseEnter={prefetch}>...</div>;
}
```

### Manual Cache Updates

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { movieKeys } from '@/lib/queryKeys';

const queryClient = useQueryClient();

// Invalidate cache
queryClient.invalidateQueries({ queryKey: movieKeys.trending() });

// Update cache manually
queryClient.setQueryData(movieKeys.detail(123), newData);
```

## DevTools

React Query DevTools are available in development mode (bottom-right corner).

## Best Practices

1. **Use query keys from factory** - Import from `@/lib/queryKeys`
2. **Handle loading states** - Always show loading UI
3. **Handle errors gracefully** - Show error messages to users
4. **Optimize with enabled** - Don't fetch data you don't need yet
5. **Prefetch on hover** - Better perceived performance
6. **Use stale-while-revalidate** - Show cached data immediately

## Example Components

See `components/examples/QueryHooksExample.tsx` for working examples.

## Troubleshooting

### Data not updating?

- Check stale time in cache configuration
- Use `refetch()` to force update
- Invalidate queries after mutations

### Infinite loading?

- Check `enabled` option
- Verify API key in environment variables
- Check network tab for errors

### Type errors?

- Ensure all types are imported from `@/types/movie`
- Use proper generic types with UseQueryResult
