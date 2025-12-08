/**
 * TMDB API Client
 * Handles all interactions with The Movie Database API
 */

import {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBMoviesResponse,
  TMDBSearchResponse,
  TMDBCredits,
  TMDBVideosResponse,
  TMDBGenre,
  TMDBErrorResponse,
  TMDBError,
  TMDBQueryParams,
  TMDBSearchParams,
} from '@/types/movie';
import type {
  TVShow,
  TVSeason,
  TVEpisode,
  TVShowSearchResult,
  TVSeasonDetail,
  TVEpisodeDetail,
} from '@/types/tv';
import { TMDB_API_BASE_URL } from '@/lib/constants';

/**
 * Rate limiter for TMDB API requests
 */
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval: number;

  constructor(requestsPerSecond: number = 4) {
    // TMDB allows 50 requests per second, we'll use 4 to be safe
    this.minInterval = 1000 / requestsPerSecond;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;

          if (timeSinceLastRequest < this.minInterval) {
            await new Promise((r) => setTimeout(r, this.minInterval - timeSinceLastRequest));
          }

          this.lastRequestTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.processQueue();
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private processQueue(): void {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const next = this.queue.shift();
    if (next) next();
  }
}

/**
 * TMDB API Client Configuration
 */
interface TMDBClientConfig {
  apiKey: string;
  language?: string;
  region?: string;
  includeAdult?: boolean;
}

/**
 * Main TMDB API Client
 */
export class TMDBClient {
  private apiKey: string;
  private language: string;
  private region: string;
  private includeAdult: boolean;
  private rateLimiter: RateLimiter;
  private genresCache: TMDBGenre[] | null = null;

  constructor(config: TMDBClientConfig) {
    this.apiKey = config.apiKey;
    this.language = config.language || 'en-US';
    this.region = config.region || 'US';
    this.includeAdult = config.includeAdult || false;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, unknown> = {}): string {
    const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);

    // Add default params
    url.searchParams.set('language', this.language);

    // Add custom params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Make API request with error handling
   */
  private async request<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
    return this.rateLimiter.execute(async () => {
      const url = this.buildUrl(endpoint, params);

      try {
        // console.log('[TMDBClient] Making request to:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData: TMDBErrorResponse = await response.json().catch(() => ({
            status_code: response.status,
            status_message: response.statusText,
            success: false,
          }));

          throw new TMDBError(
            `TMDB API Error: ${errorData.status_message}`,
            errorData.status_code,
            errorData.status_message
          );
        }

        const data: T = await response.json();
        // console.log('[TMDBClient] Success, received data');
        return data;
      } catch (error) {
        console.error('[TMDBClient] Request failed:', error);

        if (error instanceof TMDBError) {
          throw error;
        }

        // Network or parsing error
        throw new TMDBError(
          `Failed to fetch from TMDB: ${error instanceof Error ? error.message : 'Unknown error'}`,
          0,
          'Network Error'
        );
      }
    });
  }

  /**
   * Get movie genres (cached)
   */
  async getGenres(): Promise<TMDBGenre[]> {
    if (this.genresCache) {
      return this.genresCache;
    }

    const response = await this.request<{ genres: TMDBGenre[] }>('/genre/movie/list');
    this.genresCache = response.genres;
    return this.genresCache;
  }

  /**
   * Get trending movies
   */
  async getTrending(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1
  ): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>(`/trending/movie/${timeWindow}`, {
      page,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Get popular movies
   */
  async getPopular(page: number = 1): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>('/movie/popular', {
      page,
      region: this.region,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Get top rated movies
   */
  async getTopRated(page: number = 1): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>('/movie/top_rated', {
      page,
      region: this.region,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Get now playing movies
   */
  async getNowPlaying(page: number = 1): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>('/movie/now_playing', {
      page,
      region: this.region,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Get upcoming movies
   */
  async getUpcoming(page: number = 1): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>('/movie/upcoming', {
      page,
      region: this.region,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Get movie details
   */
  async getMovieDetail(movieId: number): Promise<TMDBMovieDetail> {
    return this.request<TMDBMovieDetail>(`/movie/${movieId}`);
  }

  /**
   * Get movie credits (cast and crew)
   */
  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    return this.request<TMDBCredits>(`/movie/${movieId}/credits`);
  }

  /**
   * Get movie videos (trailers, teasers, etc.)
   */
  async getMovieVideos(movieId: number): Promise<TMDBVideosResponse> {
    return this.request<TMDBVideosResponse>(`/movie/${movieId}/videos`);
  }

  /**
   * Get similar movies
   */
  async getSimilarMovies(movieId: number, page: number = 1): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>(`/movie/${movieId}/similar`, {
      page,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Get movie recommendations
   */
  async getRecommendations(movieId: number, page: number = 1): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>(`/movie/${movieId}/recommendations`, {
      page,
      include_adult: this.includeAdult,
    });
  }

  /**
   * Search movies
   */
  async searchMovies(
    query: string,
    params: Partial<TMDBSearchParams> = {}
  ): Promise<TMDBSearchResponse> {
    return this.request<TMDBSearchResponse>('/search/movie', {
      query,
      page: params.page || 1,
      include_adult: params.include_adult ?? this.includeAdult,
      region: this.region,
      primary_release_year: params.primary_release_year,
      year: params.year,
    });
  }

  /**
   * Discover movies with filters
   */
  async discoverMovies(params: TMDBQueryParams = {}): Promise<TMDBMoviesResponse> {
    return this.request<TMDBMoviesResponse>('/discover/movie', {
      ...params,
      include_adult: params.include_adult ?? this.includeAdult,
      region: this.region,
    });
  }

  /**
   * Get multiple movie details in parallel (with rate limiting)
   */
  async getMultipleMovieDetails(movieIds: number[]): Promise<TMDBMovieDetail[]> {
    const promises = movieIds.map((id) => this.getMovieDetail(id));
    return Promise.all(promises);
  }

  /**
   * Get full movie information (details + credits + videos)
   */
  async getFullMovieInfo(movieId: number): Promise<{
    details: TMDBMovieDetail;
    credits: TMDBCredits;
    videos: TMDBVideosResponse;
  }> {
    const [details, credits, videos] = await Promise.all([
      this.getMovieDetail(movieId),
      this.getMovieCredits(movieId),
      this.getMovieVideos(movieId),
    ]);

    return { details, credits, videos };
  }

  // ============================================
  // TV SHOWS API METHODS
  // ============================================

  /**
   * Get trending TV shows
   */
  async getTrendingTV(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1
  ): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>(`/trending/tv/${timeWindow}`, {
      page,
      language: this.language,
    });
  }

  /**
   * Get popular TV shows
   */
  async getPopularTV(page: number = 1): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>('/tv/popular', {
      page,
      language: this.language,
    });
  }

  /**
   * Get top rated TV shows
   */
  async getTopRatedTV(page: number = 1): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>('/tv/top_rated', {
      page,
      language: this.language,
    });
  }

  /**
   * Get TV shows airing today
   */
  async getAiringTodayTV(page: number = 1): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>('/tv/airing_today', {
      page,
      language: this.language,
    });
  }

  /**
   * Get TV shows currently on the air
   */
  async getOnTheAirTV(page: number = 1): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>('/tv/on_the_air', {
      page,
      language: this.language,
    });
  }

  /**
   * Get TV show details
   */
  async getTVShow(tvId: number): Promise<TVShow> {
    return this.request<TVShow>(`/tv/${tvId}`, {
      language: this.language,
    });
  }

  /**
   * Get TV season details with episodes
   */
  async getTVSeason(tvId: number, seasonNumber: number): Promise<TVSeasonDetail> {
    return this.request<TVSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, {
      language: this.language,
    });
  }

  /**
   * Get TV episode details
   */
  async getTVEpisode(
    tvId: number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<TVEpisodeDetail> {
    return this.request<TVEpisodeDetail>(
      `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      {
        language: this.language,
      }
    );
  }

  /**
   * Get TV show credits (cast and crew)
   */
  async getTVCredits(tvId: number): Promise<TMDBCredits> {
    return this.request<TMDBCredits>(`/tv/${tvId}/credits`, {
      language: this.language,
    });
  }

  /**
   * Get TV show videos (trailers, teasers, etc.)
   */
  async getTVVideos(tvId: number): Promise<TMDBVideosResponse> {
    return this.request<TMDBVideosResponse>(`/tv/${tvId}/videos`, {
      language: this.language,
    });
  }

  /**
   * Get similar TV shows
   */
  async getSimilarTV(tvId: number, page: number = 1): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>(`/tv/${tvId}/similar`, {
      page,
      language: this.language,
    });
  }

  /**
   * Get TV show recommendations
   */
  async getTVRecommendations(tvId: number, page: number = 1): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>(`/tv/${tvId}/recommendations`, {
      page,
      language: this.language,
    });
  }

  /**
   * Search TV shows
   */
  async searchTV(
    query: string,
    params: Partial<TMDBSearchParams> = {}
  ): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>('/search/tv', {
      query,
      page: params.page || 1,
      include_adult: params.include_adult ?? this.includeAdult,
      first_air_date_year: params.year,
    });
  }

  /**
   * Discover TV shows with filters
   */
  async discoverTV(params: TMDBQueryParams = {}): Promise<TVShowSearchResult> {
    return this.request<TVShowSearchResult>('/discover/tv', {
      ...params,
      include_adult: params.include_adult ?? this.includeAdult,
    });
  }

  /**
   * Search both movies and TV shows (multi-search)
   */
  async searchMulti(
    query: string,
    params: Partial<TMDBSearchParams> = {}
  ): Promise<{
    page: number;
    results: (TMDBMovie | TVShow)[];
    total_pages: number;
    total_results: number;
  }> {
    return this.request('/search/multi', {
      query,
      page: params.page || 1,
      include_adult: params.include_adult ?? this.includeAdult,
    });
  }

  /**
   * Get multiple TV show details in parallel (with rate limiting)
   */
  async getMultipleTVDetails(tvIds: number[]): Promise<TVShow[]> {
    const promises = tvIds.map((id) => this.getTVShow(id));
    return Promise.all(promises);
  }

  /**
   * Get full TV show information (details + credits + videos)
   */
  async getFullTVInfo(tvId: number): Promise<{
    details: TVShow;
    credits: TMDBCredits;
    videos: TMDBVideosResponse;
  }> {
    const [details, credits, videos] = await Promise.all([
      this.getTVShow(tvId),
      this.getTVCredits(tvId),
      this.getTVVideos(tvId),
    ]);

    return { details, credits, videos };
  }
}

/**
 * Singleton instance creator
 */
let tmdbClient: TMDBClient | null = null;

export function createTMDBClient(config: TMDBClientConfig): TMDBClient {
  if (!tmdbClient) {
    tmdbClient = new TMDBClient(config);
  }
  return tmdbClient;
}

export function getTMDBClient(): TMDBClient {
  if (!tmdbClient) {
    throw new Error('TMDB client not initialized. Call createTMDBClient first.');
  }
  return tmdbClient;
}
