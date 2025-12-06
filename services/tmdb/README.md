# TMDB Service Documentation

## Overview

The TMDB service provides a complete integration with The Movie Database API, including rate limiting, error handling, and automatic data transformation.

## Quick Start

### 1. Get API Key

Sign up at [https://www.themoviedb.org/](https://www.themoviedb.org/) and get your API key from Settings → API.

### 2. Configure Environment

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local and add your API key
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

### 3. Basic Usage

```typescript
import { getTrendingMovies, getMovieDetails, searchMovies } from '@/services/tmdb';

// Get trending movies
const trending = await getTrendingMovies('week', 1);
console.log(trending.movies); // Array of Movie objects

// Get movie details
const movie = await getMovieDetails(550); // Fight Club
console.log(movie.title, movie.runtime, movie.cast);

// Search movies
const results = await searchMovies('inception');
console.log(results.movies);
```

## Architecture

### File Structure

```
services/tmdb/
├── client.ts       # Low-level TMDB API client
├── service.ts      # High-level service functions
└── index.ts        # Barrel exports

lib/tmdb/
├── config.ts       # Client initialization
├── transformer.ts  # Data transformation
├── images.ts       # Image URL helpers
└── test.ts         # Integration tests

types/
└── movie.ts        # TypeScript interfaces
```

### Data Flow

```
TMDB API Response → TMDBClient → Transformer → Application Types
```

## API Reference

### Service Functions (Recommended)

These functions return transformed data ready for use in components:

#### `getTrendingMovies(timeWindow, page)`

Get trending movies.

```typescript
const trending = await getTrendingMovies('week', 1);
// Returns: MoviesPage with Movie[]
```

#### `getPopularMovies(page)`

Get popular movies.

```typescript
const popular = await getPopularMovies(1);
// Returns: MoviesPage with Movie[]
```

#### `getTopRatedMovies(page)`

Get top rated movies.

#### `getNowPlayingMovies(page)`

Get movies currently in theaters.

#### `getUpcomingMovies(page)`

Get upcoming movie releases.

#### `getMovieDetails(movieId)`

Get complete movie information including cast, crew, and videos.

```typescript
const movie = await getMovieDetails(550);
// Returns: MovieDetail with full information
```

#### `getSimilarMovies(movieId, page)`

Get movies similar to a specific movie.

#### `getMovieRecommendations(movieId, page)`

Get movie recommendations based on a specific movie.

#### `searchMovies(query, params)`

Search for movies.

```typescript
const results = await searchMovies('inception', {
  page: 1,
  primary_release_year: 2010,
});
// Returns: MoviesPage with Movie[]
```

#### `discoverMovies(params)`

Discover movies with advanced filters.

```typescript
const filtered = await discoverMovies({
  page: 1,
  with_genres: '28,12', // Action, Adventure
  'vote_average.gte': 7.0,
  'release_date.gte': '2020-01-01',
});
```

### Client Methods (Advanced)

For advanced usage, you can access the TMDB client directly:

```typescript
import { getTMDBClient } from '@/services/tmdb';

const client = getTMDBClient();

// Raw API responses (not transformed)
const response = await client.getTrending('week', 1);
console.log(response.results); // TMDBMovie[] (raw TMDB format)
```

## Image Utilities

### Get Image URLs

```typescript
import { getPosterUrl, getBackdropUrl, getProfileUrl } from '@/lib/tmdb/images';

// Get poster URL
const posterUrl = getPosterUrl(movie.posterPath, 'lg'); // w342 size
const backdropUrl = getBackdropUrl(movie.backdropPath, 'lg'); // w1280 size
const profileUrl = getProfileUrl(cast[0].profilePath, 'md'); // w185 size
```

### Responsive Images

```typescript
import { getPosterSrcSet, getBackdropSrcSet } from '@/lib/tmdb/images';

// Get srcset for responsive images
const srcset = getPosterSrcSet(movie.posterPath);
// Returns: "url1 154w, url2 185w, url3 342w, url4 500w"

<img src={getPosterUrl(movie.posterPath)} srcSet={srcset} sizes="(max-width: 768px) 154px, 342px" />
```

### Available Sizes

**Posters:** `xs` (92px), `sm` (154px), `md` (185px), `lg` (342px), `xl` (500px), `2xl` (780px), `original`

**Backdrops:** `sm` (300px), `md` (780px), `lg` (1280px), `original`

**Profiles:** `sm` (45px), `md` (185px), `lg` (632px), `original`

## Type Definitions

### Movie

Simplified movie type for lists and cards.

```typescript
interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  releaseYear: number | null;
  genres: string[]; // Genre names (not IDs)
  rating: number; // 0-10, rounded to 1 decimal
  voteCount: number;
  popularity: number;
  isAdult: boolean;
  language: string;
}
```

### MovieDetail

Extended movie type with full information.

```typescript
interface MovieDetail extends Movie {
  runtime: number | null; // Minutes
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  homepage: string | null;
  imdbId: string | null;
  spokenLanguages: string[];
  productionCompanies: string[];
  productionCountries: string[];
  collection: { ... } | null;
  cast: Cast[];
  crew: Crew[];
  videos: Video[];
}
```

### MoviesPage

Paginated response type.

```typescript
interface MoviesPage {
  page: number;
  movies: Movie[];
  totalPages: number;
  totalResults: number;
}
```

## Error Handling

All API errors are wrapped in `TMDBError`:

```typescript
import { TMDBError } from '@/types/movie';

try {
  const movies = await getTrendingMovies('week', 1);
} catch (error) {
  if (error instanceof TMDBError) {
    console.error('TMDB Error:', error.statusCode, error.statusMessage);
  } else {
    console.error('Network Error:', error);
  }
}
```

## Rate Limiting

The client includes automatic rate limiting (4 requests per second by default) to prevent API quota exhaustion. Requests are queued and executed with appropriate delays.

## Testing

Run the test utility to verify your integration:

```bash
npm run dev

# In another terminal
node --loader ts-node/esm lib/tmdb/test.ts
```

Or add to `package.json`:

```json
{
  "scripts": {
    "test:tmdb": "tsx lib/tmdb/test.ts"
  }
}
```

## Best Practices

1. **Use service functions** instead of client methods for automatic data transformation
2. **Cache aggressively** - movie data doesn't change often (use TanStack Query)
3. **Handle errors gracefully** - show fallback UI when API fails
4. **Use responsive images** - leverage srcset for better performance
5. **Respect rate limits** - the built-in rate limiter handles this automatically

## Next Steps

- Integrate with TanStack Query for caching (Phase 1.4)
- Create custom hooks: `useTrendingMovies()`, `useMovieDetail()`, etc.
- Build movie card components with optimized images
- Implement search with debouncing
