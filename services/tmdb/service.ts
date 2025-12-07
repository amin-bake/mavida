/**
 * TMDB Service
 * High-level API for movie data with automatic transformation
 */

import { getTMDBClient, createTMDBClient } from './client';
import {
  transformMovie,
  transformMovieDetail,
  transformCast,
  transformCrew,
  transformVideos,
} from '@/lib/tmdb/transformer';
import type {
  Movie,
  MovieDetail,
  MoviesPage,
  TMDBSearchParams,
  TMDBQueryParams,
} from '@/types/movie';

/**
 * Get or initialize TMDB client
 */
function getClient() {
  try {
    return getTMDBClient();
  } catch (error) {
    // Client not initialized, create it now
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY environment variable');
    }
    return createTMDBClient({
      apiKey,
      language: process.env.NEXT_PUBLIC_TMDB_LANGUAGE || 'en-US',
      region: process.env.NEXT_PUBLIC_TMDB_REGION || 'US',
      includeAdult: process.env.NEXT_PUBLIC_TMDB_INCLUDE_ADULT === 'true',
    });
  }
}

/**
 * Get trending movies (transformed)
 */
export async function getTrendingMovies(
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1
): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([
    client.getTrending(timeWindow, page),
    client.getGenres(),
  ]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Get popular movies (transformed)
 */
export async function getPopularMovies(page: number = 1): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([client.getPopular(page), client.getGenres()]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Get top rated movies (transformed)
 */
export async function getTopRatedMovies(page: number = 1): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([client.getTopRated(page), client.getGenres()]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Get now playing movies (transformed)
 */
export async function getNowPlayingMovies(page: number = 1): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([client.getNowPlaying(page), client.getGenres()]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Get upcoming movies (transformed)
 */
export async function getUpcomingMovies(page: number = 1): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([client.getUpcoming(page), client.getGenres()]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Get full movie details (transformed)
 */
export async function getMovieDetails(movieId: number): Promise<MovieDetail> {
  const client = getClient();
  const { details, credits, videos } = await client.getFullMovieInfo(movieId);

  return transformMovieDetail(details, credits.cast, credits.crew, videos.results);
}

/**
 * Get similar movies (transformed)
 */
export async function getSimilarMovies(movieId: number, page: number = 1): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([
    client.getSimilarMovies(movieId, page),
    client.getGenres(),
  ]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Get movie recommendations (transformed)
 */
export async function getMovieRecommendations(
  movieId: number,
  page: number = 1
): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([
    client.getRecommendations(movieId, page),
    client.getGenres(),
  ]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Search movies (transformed)
 */
export async function searchMovies(
  query: string,
  params: Partial<TMDBSearchParams> = {}
): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([
    client.searchMovies(query, params),
    client.getGenres(),
  ]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

/**
 * Discover movies with filters (transformed)
 */
export async function discoverMovies(params: TMDBQueryParams = {}): Promise<MoviesPage> {
  const client = getClient();
  const [response, genres] = await Promise.all([client.discoverMovies(params), client.getGenres()]);

  return {
    page: response.page,
    movies: response.results.map((movie) => transformMovie(movie, genres)),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}
