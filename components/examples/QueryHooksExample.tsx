/**
 * Example Component - TanStack Query Hooks Usage
 * This file demonstrates how to use the custom movie hooks
 * Remove this file once you've implemented your actual components
 */

'use client';

import { useTrendingMovies, usePopularMovies, useMovieDetail, useSearchMovies } from '@/hooks';

export function ExampleMovieList() {
  // Fetch trending movies (page 1)
  const { data: trending, isLoading, error } = useTrendingMovies('week', 1);

  if (isLoading) return <div>Loading trending movies...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Trending Movies</h2>
      <ul>
        {trending?.movies.map((movie) => (
          <li key={movie.id}>
            {movie.title} ({movie.releaseYear}) - Rating: {movie.rating}/10
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExampleMovieDetail({ movieId }: { movieId: number }) {
  // Fetch movie details
  const { data: movie, isLoading, error } = useMovieDetail(movieId);

  if (isLoading) return <div>Loading movie details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!movie) return null;

  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
      <p>Runtime: {movie.runtime} minutes</p>
      <p>Rating: {movie.rating}/10</p>
      <p>Genres: {movie.genres.join(', ')}</p>

      <h3>Cast</h3>
      <ul>
        {movie.cast.slice(0, 5).map((actor) => (
          <li key={actor.id}>
            {actor.name} as {actor.character}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExampleSearchResults({ query }: { query: string }) {
  // Search movies with debouncing handled by parent component
  const { data, isLoading, error } = useSearchMovies(query, { page: 1 });

  if (!query) return <div>Enter a search query</div>;
  if (isLoading) return <div>Searching...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Search Results for &quo;{query}&rdquo;</h2>
      <p>Found {data?.totalResults} results</p>
      <ul>
        {data?.movies.map((movie) => (
          <li key={movie.id}>
            {movie.title} ({movie.releaseYear})
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExampleMultipleQueries() {
  // Fetch multiple data sources in parallel
  const trending = useTrendingMovies('week', 1);
  const popular = usePopularMovies(1);

  const isLoading = trending.isLoading || popular.isLoading;
  const hasError = trending.error || popular.error;

  if (isLoading) return <div>Loading...</div>;
  if (hasError) return <div>Error loading data</div>;

  return (
    <div>
      <section>
        <h2>Trending This Week</h2>
        <p>{trending.data?.movies.length} movies</p>
      </section>

      <section>
        <h2>Popular Movies</h2>
        <p>{popular.data?.movies.length} movies</p>
      </section>
    </div>
  );
}
